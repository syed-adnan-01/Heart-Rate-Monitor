import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import time
import os
import requests
import matplotlib.pyplot as plt

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
wave_display = np.zeros((200, 600, 3), dtype=np.uint8) 
bpm, last_peak_time, apnea_timer = 0, time.time(), time.time()
status = "INITIALIZING"
going_up = False
is_calibrated = False

print("--- FINAL CLINICAL MONITOR: ZERO-CROSSING + SNR GUARD ---")

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
        roi_x, roi_y, roi_w, roi_h = int(w*0.35), int(h*0.35), int(w*0.3), int(h*0.25)
        if detection_result and detection_result.pose_landmarks:
            try:
                p = detection_result.pose_landmarks[0] 
                sh_cy = (p[11].y + p[12].y) / 2
                hip_y = min(p[23].y, p[24].y)
                chest_y = sh_cy + ((hip_y - sh_cy) * 0.25)
                roi_w = int(abs(p[11].x - p[12].x) * w * 0.8)
                roi_h = int(h * 0.15)
                roi_x = int(((p[11].x + p[12].x)/2 * w) - (roi_w // 2))
                roi_y = int(chest_y * h - (roi_h // 2))
            except: pass

        roi_x, roi_y = max(0, roi_x), max(0, roi_y)
        roi_w, roi_h = max(10, min(roi_w, w - roi_x - 5)), max(10, min(roi_h, h - roi_y - 5))
        cv2.rectangle(frame, (roi_x, roi_y), (roi_x + roi_w, roi_y + roi_h), (0, 255, 0), 2)
        roi_gray = gray[roi_y:roi_y+roi_h, roi_x:roi_x+roi_w]

        if prev_gray is not None:
            prev_roi = prev_gray[roi_y:roi_y+roi_h, roi_x:roi_x+roi_w]
            if prev_roi.shape == roi_gray.shape:
                flow = cv2.calcOpticalFlowFarneback(prev_roi, roi_gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                motion_val = (np.mean(flow[..., 1]) * 3500) # Increased sensitivity
                
                smoothed_val = np.mean(movement_history[-8:] + [motion_val]) if len(movement_history) > 8 else motion_val
                movement_history.append(smoothed_val)
                session_data.append(smoothed_val)
                if len(movement_history) > 600: movement_history.pop(0)

                # --- INTELLIGENT DETECTION LOGIC ---
                if len(movement_history) > 60:
                    is_calibrated = True
                    # 1. Center the signal
                    window = movement_history[-60:]
                    local_mean = np.mean(window)
                    centered_val = smoothed_val - local_mean
                    
                    # 2. Check Peak-to-Peak Energy (SNR Guard)
                    # This filters out the jitters you saw in the last graph
                    p2p_range = max(window) - min(window)
                    
                    if p2p_range < 0.25: # Jitter threshold
                        bpm = 0
                        # Visual Flatline for Demo
                        movement_history[-1] = local_mean 
                        if (time.time() - apnea_timer > 10):
                            status = "CRITICAL: APNEA"
                        else:
                            status = "STABLE / NO BREATH"
                    else:
                        # 3. Valid Rhythm Crossing
                        if centered_val < 0 and going_up:
                            curr_t = time.time()
                            diff = curr_t - last_peak_time
                            if 1.0 < diff < 5.5: # 11-60 BPM range
                                bpm = 60 / diff
                                bpm_history.append(bpm)
                                last_peak_time, apnea_timer = curr_t, curr_t
                                status = "NORMAL"
                                try: requests.post(BACKEND_URL, json={"respiratoryRate": int(bpm), "status": status}, timeout=0.01)
                                except: pass
                            going_up = False
                        elif centered_val > 0:
                            going_up = True

        if time.time() - apnea_timer > 10 and is_calibrated:
            status = "CRITICAL: APNEA"; bpm = 0

        # UI
        wave_display.fill(0)
        cv2.line(wave_display, (0, 100), (600, 100), (50, 50, 50), 1)
        if len(movement_history) > 2:
            m_baseline = np.mean(movement_history[-60:])
            pts = [(i, int(100 - ((v - m_baseline) * 20))) for i, v in enumerate(movement_history[-600:])]
            for i in range(len(pts) - 1):
                cv2.line(wave_display, pts[i], pts[i+1], (0, 255, 255), 1)

        prev_gray = gray.copy()
        color = (0, 255, 0) if status == "NORMAL" else (0, 0, 255)
        cv2.putText(frame, f"RR: {int(bpm)} BPM | {status}", (20, 50), cv2.FONT_HERSHEY_DUPLEX, 1.0, color, 2)
        cv2.imshow('NEONATAL MONITOR', frame); cv2.imshow('SIGNAL', wave_display)
        if cv2.waitKey(1) & 0xFF == ord('q'): break

except Exception: pass
finally:
    cap.release(); cv2.destroyAllWindows()
    avg_rr = int(np.mean(bpm_history)) if bpm_history else 0
    final_status = "CRITICAL: APNEA DETECTED" if status == "CRITICAL: APNEA" else "STABLE"
    
    if len(session_data) > 50:
        plt.figure(figsize=(10, 5)); plt.style.use('dark_background')
        plt.plot(session_data, color='cyan')
        plt.axhline(y=np.mean(session_data), color='red', linestyle='--', label="Adaptive Baseline")
        plt.title(f"Clinical Report | Avg RR: {avg_rr} BPM | Status: {final_status}", color='yellow')
        plt.legend(); plt.show()