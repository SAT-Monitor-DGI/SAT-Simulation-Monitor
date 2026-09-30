import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    satelliteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Satellite' },
    commandType: String,
    payload: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ['queued', 'executed', 'rejected'], default: 'queued' },
    executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
export default mongoose.model('CommandLog', schema);
