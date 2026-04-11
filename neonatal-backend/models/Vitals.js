
const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
    patientId: { type: String, default: "NEO-001" },
    respiratoryRate: Number,
    status: String, // NORMAL or CRITICAL
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vitals', VitalsSchema);