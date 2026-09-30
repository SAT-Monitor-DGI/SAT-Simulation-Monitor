import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    noradId: { type: Number, required: true, unique: true, index: true },
    source: { type: String, enum: ['NORAD', 'CUSTOM'], default: 'CUSTOM' },
    internationalDesignator: String,
    tle: { line1: String, line2: String, epoch: String },
    rawData: { type: mongoose.Schema.Types.Mixed },
    orbitalParameters: {
      inclination: Number,
      eccentricity: Number,
      meanMotion: Number,
      argumentOfPerigee: Number,
      rightAscension: Number,
      meanAnomaly: Number,
      semiMajorAxis: Number,
    },
    simulation: {
      enabled: { type: Boolean, default: false },
      speedMultiplier: { type: Number, default: 1 },
    },
    status: { type: String, enum: ['active', 'inactive', 'critical'], default: 'active' },
    lastPosition: {
      latitude: Number,
      longitude: Number,
      altitude: Number,
      velocity: Number,
      timestamp: Date,
    },
  },
  { timestamps: true },
);
export default mongoose.model('Satellite', schema);
