import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
  },
  { timestamps: true },
);
export default mongoose.model('User', schema);
