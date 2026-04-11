# NeoVision AI 🫁🩺
**Non-Contact, AI-Powered Neonatal Health Monitoring System**

NeoVision AI is an advanced, medical-grade monitoring dashboard designed for neonatal intensive care units (NICU). It aims to replace invasive ECG patches and SpO2 probes with a continuous, 100% non-contact, camera-based vital sign monitoring system.

By analyzing macro- and micro-movements of an infant's chest cavity using advanced computer vision models, NeoVision evaluates real-time respiratory stability and automatically triggers alerts for apneic events or respiratory distress without ever touching the patient's delicate skin.

---

## 🌟 Key Features
- **Zero-Contact Sensing:** Uses high-definition RGB cameras and Google's MediaPipe models to track bodily landmarks and calculate respiratory rhythms.
- **Live Clinical Dashboard:** An interactive React-based UI that visualizes raw telemetry waveforms.
- **Dynamic Wellness Score:** A proprietary clinical penalty algorithm that calculates a rolling 0-10.0 infant stability metrics based on live ML insights.
- **Audible Alert System:** Custom WebAudio API buzzer integrated into the dashboard to loudly notify staff of high-severity Apnea/Tachypnea triggers.
- **Inspection Mode:** Clinicians can pause the rolling stream securely within the browser by manipulating an MJPEG canvas buffer to examine exact frames during clinical events.
- **Secure Cloud Storage:** Automated real-time persistence of vitals data to MongoDB for historical 7-Day trending.

---

## ⚙️ Architecture & Tech Stack

NeoVision is built across three primary decoupled nodes:

1. **The AI Sensor Pipeline (Python):** 
   Runs local inferences utilizing OpenCV and `mediapipe.tasks.vision.PoseLandmarker`. It hosts a local MJPEG Flask Server (`port 5001`) to push actual camera frames to the dashboard while simultaneously POST-ing isolated health metadata to the Node pipeline.
2. **The Ingestion Backend (Node.js/Express):** 
   A lightweight express server mapping JSON payloads directly to a secured MongoDB Atlas DB while simultaneously piping WebSocket feeds downstream (`port 5000`).
3. **The Clinical UI (React/Vite & Vite):** 
   A custom built Glassmorphic dark-mode interface optimizing visibility in darker clinical settings. Utilizes `Socket.io-client` for zero-latency numeric synchronization.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20+ recommended)
- **Python** (v3.10+ recommended)
- A **MongoDB Atlas** Account/Cluster.

### 1. Environment Configuration (.env setup)
Create a `.env` file at the root of the project for the frontend and python script:
```env
VITE_API_URL=http://localhost:5000
VITE_SENSOR_STREAM_URL=http://localhost:5001
PYTHON_API_POST_URL=http://localhost:5000/api/vitals
```

Create a deeply scoped `.env` file inside the `neonatal-backend/` directory for the backend server:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DB_NAME>?retryWrites=true&w=majority
```

### 2. Dependency Installation

**Install Frontend and Backend Dependencies:**
```bash
npm install
cd neonatal-backend
npm install
```

**Install Python Computer Vision Dependencies:**
If you haven't already, setup a simple virtual environment inside the project:
```bash
python3 -m venv venv
source venv/bin/activate
pip install mediapipe opencv-python matplotlib flask flask-cors python-dotenv requests
```

### 3. Startup Procedures

NeoVision can be brought online with two concurrent processes:

**Start the Dashboards:**
From the root directory, leverage the pre-configured `concurrently` script to boot both Vite and the Node.js API server simultaneously:
```bash
npm run dev
```

**Start the AI Camera Sensor:**
In a separate terminal window, execute the trained monitor model:
```bash
./venv/bin/python neonates_sensor/final_monitor.py
```
*(Ensure your host machine has USB/Integrated camera permissions allowed).*

---

## 🔒 Security Notice
- Note that `.env` files and `node_modules` are inherently ignored from repository commits to secure cluster database strings. Ensure your backend ports are secured behind an SSL barrier when deploying for internal hospital routing.
- This codebase is isolated and does not persist recorded patient video frames to cloud storage, satisfying generalized HIPAA compliance for edge telemetry.
