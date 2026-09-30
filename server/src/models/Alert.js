import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    satelliteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Satellite' },
    type: String,
    severity: { type: String, enum: ['warning', 'critical'] },
    message: String,
    acknowledged: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
export default mongoose.model('Alert', schema);
