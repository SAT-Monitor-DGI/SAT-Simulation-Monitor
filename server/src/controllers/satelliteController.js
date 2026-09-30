import Satellite from '../models/Satellite.js';
import TelemetryLog from '../models/TelemetryLog.js';
import CommandLog from '../models/CommandLog.js';
import Alert from '../models/Alert.js';
import { importNorad } from '../services/noradService.js';
import { startSimulation, stopSimulation, isRunning } from '../services/simulator.js';
function mapRaw(raw) {
  return {
    name: raw.OBJECT_NAME || raw.object_name || `NORAD ${raw.NORAD_CAT_ID || raw.norad_cat_id}`,
    noradId: Number(raw.NORAD_CAT_ID || raw.norad_cat_id),
    internationalDesignator: raw.OBJECT_ID || raw.object_id,
    tle: { epoch: raw.EPOCH },
    rawData: raw,
    orbitalParameters: {
      inclination: Number(raw.INCLINATION),
      eccentricity: Number(raw.ECCENTRICITY),
      meanMotion: Number(raw.MEAN_MOTION),
      argumentOfPerigee: Number(raw.ARG_OF_PERICENTER),
      rightAscension: Number(raw.RA_OF_ASC_NODE),
      meanAnomaly: Number(raw.MEAN_ANOMALY),
    },
  };
}
export async function list(req, res) {
  res.json(await Satellite.find().sort({ createdAt: -1 }));
}
export async function get(req, res) {
  const s = await Satellite.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
}
export async function importSatellite(req, res) {
  try {
    const { noradId } = req.body;
    const { raw, tle } = await importNorad(noradId);
    const mapped = mapRaw(raw);
    if (tle) {
      mapped.name = tle.name || mapped.name;
      mapped.tle = { ...mapped.tle, line1: tle.line1, line2: tle.line2 };
    }
    const existing = await Satellite.findOne({ noradId: mapped.noradId });
    const s = existing
      ? await Satellite.findByIdAndUpdate(existing.id, mapped, { new: true })
      : await Satellite.create({ ...mapped, source: 'NORAD' });
    res.status(existing ? 200 : 201).json({ satellite: s, simulatable: Boolean(tle?.line1) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}
export async function create(req, res) {
  const s = await Satellite.create({ ...req.body, source: 'CUSTOM' });
  res.status(201).json(s);
}
export async function remove(req, res) {
  stopSimulation(req.params.id);
  await Satellite.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}
export async function simulate(req, res) {
  const s = await Satellite.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  if (!s.tle?.line1)
    return res.status(400).json({
      message: 'This satellite has no compatible TLE for SGP4 simulation',
    });
  const enabled = req.body.enabled !== false;
  if (enabled) {
    startSimulation(s);
    res.json({ running: true });
  } else {
    stopSimulation(s.id);
    s.simulation.enabled = false;
    await s.save();
    res.json({ running: false });
  }
}
export async function telemetry(req, res) {
  res.json(
    await TelemetryLog.find({ satelliteId: req.params.id }).sort({ timestamp: -1 }).limit(100),
  );
}
export async function commands(req, res) {
  const s = await Satellite.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  const c = await CommandLog.create({
    satelliteId: s.id,
    commandType: req.body.commandType || 'PING',
    payload: req.body.payload || {},
    status: 'executed',
    executedBy: req.user.id,
  });
  res.json(c);
}
export async function logs(req, res) {
  res.json({
    telemetry: await TelemetryLog.find().sort({ timestamp: -1 }).limit(50),
    commands: await CommandLog.find()
      .populate('executedBy', 'username')
      .sort({ timestamp: -1 })
      .limit(50),
    alerts: await Alert.find().sort({ timestamp: -1 }).limit(50),
  });
}
