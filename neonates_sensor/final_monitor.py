import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import time
import os
import requests
import matplotlib.pyplot as plt
import threading
from flask import Flask, Response
from flask_cors import CORS

# --- FLASK M-JPEG SERVER SETUP ---
app = Flask(__name__)
CORS(app)

global_frame = None
global_wave = None
lock = threading.Lock()

def generate_feed(feed_type="video"):
    global global_frame, global_wave
    while True:
        with lock:
            img = global_frame if feed_type == "video" else global_wave
        
        if img is None:
            time.sleep(0.05)
            continue
            
        ret, buffer = cv2.imencode('.jpg', img)
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03)

@app.route('/video_feed')
def video_feed():
    return Response(generate_feed("video"), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/signal_feed')
def signal_feed():
    return Response(generate_feed("signal"), mimetype='multipart/x-mixed-replace; boundary=frame')

def run_flask():
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False, threaded=True)

# 1. SETUP
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'pose_landmarker_heavy.task')
BACKEND_URL = "http://localhost:5000/api/vitals"

base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.PoseLandmarkerOptions(base_options=base_options, running_mode=vision.RunningMode.VIDEO)
detector = vision.PoseLandmarker.create_from_options(options)
clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))

cap = cv2.VideoCapture(0)
prev_gray = None
movement_history = []
session_data = []      
bpm_history = []       
wave_display = np.zeros((300, 600, 3), dtype=np.uint8) 
bpm, last_peak_time, apnea_timer = 0, time.time(), time.time()
status = "STABILIZING"
going_up = False

# --- THE "DEAD-ZONE" SETTINGS ---
smooth_roi = None 
roi_alpha = 0.2     # Fast tracking
# This is your 'Narrow Gap'. Any jitter between -0.2 and 0.2 is killed to 0.
dead_zone_gap = 0.22 

print("--- HARD-GATE MONITOR: JITTER-KILLER + FLASK MJPEG OVER PORT 5001 ACTIVE ---")

# Start Flask in background thread
flask_thread = threading.Thread(target=run_flask, daemon=True)
flask_thread.start()

bpm = 0
status = "STABLE"

def send_data_async(payload):
    def _send():
        try:
            requests.post(BACKEND_URL, json=payload, timeout=2.0)
        except Exception as e:
            pass
    threading.Thread(target=_send, daemon=True).start()

last_post_time = time.time()

try:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        h, w, _ = frame.shape
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = clahe.apply(gray) 
        
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)
        detection_result = detector.detect_for_video(mp_image, int(time.time() * 1000))
        
        # ROI Anchoring
        target_roi = [int(w*0.35), int(h*0.35), int(w*0.3), int(h*0.25)]
        if detection_result and detection_result.pose_landmarks:
            try:
                p = detection_result.pose_landmarks[0] 
                sh_cy = (p[11].y + p[12].y) / 2
                hip_y = min(p[23].y, p[24].y)
                chest_y = sh_cy + ((hip_y - sh_cy) * 0.25)
                tw, th = int(abs(p[11].x - p[12].x) * w * 0.9), int(h * 0.18)
                tx, ty = int(((p[11].x + p[12].x)/2 * w) - (tw // 2)), int(chest_y * h - (th // 2))
                target_roi = [tx, ty, tw, th]
            except: pass

        if smooth_roi is None: smooth_roi = target_roi
        else: smooth_roi = [int(smooth_roi[i]*0.8 + target_roi[i]*0.2) for i in range(4)]

        rx, ry, rw, rh = smooth_roi
        rx, ry = max(0, rx), max(0, ry)
        rw, rh = max(10, min(rw, w - rx - 5)), max(10, min(rh, h - ry - 5))
        cv2.rectangle(frame, (rx, ry), (rx + rw, ry + rh), (0, 255, 0), 2)
        roi_gray = gray[ry:ry+rh, rx:rx+rw]

        if prev_gray is not None:
            prev_roi = prev_gray[ry:ry+rh, rx:rx+rw]
            if prev_roi.shape == roi_gray.shape and prev_roi.size > 0:
                flow = cv2.calcOpticalFlowFarneback(prev_roi, roi_gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                # SENSITIVITY BOOST
                motion_val = (np.mean(flow[..., 1]) * 5000) 
                
                # Light smoothing
                raw_smoothed = np.mean(movement_history[-8:] + [motion_val]) if len(movement_history) > 8 else motion_val
                
                if len(movement_history) > 60:
                    local_mean = np.mean(movement_history[-60:])
                    centered_val = raw_smoothed - local_mean
                    
                    # --- THE HARD DEAD-ZONE GATE ---
                    if abs(centered_val) < dead_zone_gap:
                        final_signal = 0
                    else:
                        final_signal = centered_val
                else:
                    final_signal = 0

                movement_history.append(raw_smoothed)
                session_data.append(final_signal) # Store the 'Cleaned' signal
                if len(movement_history) > 600: movement_history.pop(0)

                # 2. BPM & APNEA LOGIC
                if final_signal == 0:
                    status = "CRITICAL: APNEA" if (time.time() - apnea_timer > 10) else "STABLE"
                    if status == "CRITICAL: APNEA": bpm = 0
                else:
                    # Rhythmic Peak Detection
                    if final_signal < 0 and going_up:
                        curr_t = time.time()
                        diff = curr_t - last_peak_time
                        if 1.0 < diff < 6.0:
                            bpm = 60 / diff
                            bpm_history.append(bpm)
                            last_peak_time, apnea_timer = curr_t, curr_t
                            status = "NORMAL"
                        going_up = False
                    elif final_signal > 0:
                        going_up = True

        if time.time() - apnea_timer > 10: status = "CRITICAL: APNEA"; bpm = 0

        # LIVE SYNC: Post to backend every 1.0 seconds
        curr_time = time.time()
        if curr_time - last_post_time > 1.0:
            last_post_time = curr_time
            send_data_async({"respiratoryRate": int(bpm), "status": status})

        # UI
        wave_display.fill(0)
        # Visual Wall Markers (Red)
        cv2.line(wave_display, (0, 150 - int(dead_zone_gap*40)), (600, 150 - int(dead_zone_gap*40)), (0, 0, 180), 1)
        cv2.line(wave_display, (0, 150 + int(dead_zone_gap*40)), (600, 150 + int(dead_zone_gap*40)), (0, 0, 180), 1)
        
        if len(session_data) > 2:
            # Huge Scale: * 60
            pts = [(i, int(150 - (v * 60))) for i, v in enumerate(session_data[-600:])]
            for i in range(len(pts)-1): cv2.line(wave_display, pts[i], pts[i+1], (0, 255, 255), 2, cv2.LINE_AA)

        prev_gray = gray.copy()
        color = (0, 255, 0) if status == "NORMAL" else (0, 0, 255)
        cv2.putText(frame, f"RR: {int(bpm)} BPM | {status}", (20, 50), cv2.FONT_HERSHEY_DUPLEX, 1.1, color, 2)
        
        with lock:
            global_frame = frame.copy()
            global_wave = wave_display.copy()

        cv2.imshow('NICU MONITOR', frame)
        cv2.imshow('SIGNAL', wave_display)
        if cv2.waitKey(1) & 0xFF == ord('q'): break

except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    cap.release(); cv2.destroyAllWindows()
    if len(session_data) > 50:
        plt.figure(figsize=(10, 5)); plt.style.use('dark_background')
        plt.plot(session_data, color='cyan')
        plt.title(f"Clinical Report | Avg RR: {int(np.mean(bpm_history)) if bpm_history else 0} BPM", color='yellow')
        plt.show()