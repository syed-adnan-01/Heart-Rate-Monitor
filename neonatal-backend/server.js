const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Vitals = require('./models/Vitals'); 

const app = express();
app.use(cors());
app.use(express.json()); 

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});


const mongoURI = "mongodb+srv://neerajay04:neodata@neonatal-database.g3ogjcn.mongodb.net/neonatal_db?retryWrites=true&w=majority&appName=neonatal-database";

mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB Atlas Connected Successfully!'))
    .catch(err => console.error('❌ DB Connection Error:', err));


app.post('/api/vitals', async (req, res) => {
    try {
        const { respiratoryRate, status } = req.body;

        const newRecord = await Vitals.create({
            respiratoryRate,
            status,
            patientId: "NEO-001"
        });

        io.emit('vitals_update', {
            respiratoryRate,
            status,
            timestamp: new Date().toLocaleTimeString()
        });

        console.log(`📡 AI Data Sync: ${respiratoryRate} BPM | Status: ${status}`);
        res.status(200).json({ message: "Vitals received and broadcasted" });
    } catch (err) {
        console.error("Internal Server Error:", err);
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/vitals/latest', async (req, res) => {
    try {
        const latest = await Vitals.findOne().sort({ timestamp: -1 });
        res.json(latest);
    } catch (err) {
        res.status(500).json(err);
    }
});


io.on('connection', (socket) => {
    console.log('User Connected to Dashboard ✅');
    socket.on('disconnect', () => {
        console.log('User Disconnected ❌');
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});