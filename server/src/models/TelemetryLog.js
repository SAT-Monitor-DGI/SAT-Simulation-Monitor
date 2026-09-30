import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    satelliteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Satellite', required: true },
    metrics: {
      temperature: Number,
      battery: Number,
      signal: Number,
      altitude: Number,
      velocity: Number,
      latitude: Number,
      longitude: Number,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
export default mongoose.model('TelemetryLog', schema);
