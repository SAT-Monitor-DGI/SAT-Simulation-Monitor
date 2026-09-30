import Satellite from '../models/Satellite.js';
import TelemetryLog from '../models/TelemetryLog.js';
import { propagate } from './orbitService.js';
import { evaluateAlerts } from './alertService.js';
const timers = new Map();
function telemetryFor(s) {
  const now = Date.now();
  const battery = Math.max(
    5,
    Math.min(100, 70 + 20 * Math.sin(now / 900000 + s._id.toString().length)),
  );
  const temperature = 35 + 25 * Math.sin(now / 600000);
  const signal = 75 + 20 * Math.sin(now / 300000);
  const pos = propagate(s.tle, new Date());
  return { ...pos, battery, temperature, signal };
}
export function startSimulation(s) {
  stopSimulation(s.id);
  if (!s.tle?.line1) return false;
  const tick = async () => {
    try {
      const current = await Satellite.findById(s.id);
      if (!current) return stopSimulation(s.id);
      const m = telemetryFor(current);
      current.lastPosition = { ...m, timestamp: new Date() };
      current.simulation.enabled = true;
      await current.save();
      await TelemetryLog.create({ satelliteId: current._id, metrics: m });
      await evaluateAlerts(current._id, m);
    } catch (e) {
      console.error('simulation:', e.message);
    }
  };
  tick();
  const timer = setInterval(tick, 2000);
  timers.set(s.id, timer);
  return true;
}
export function stopSimulation(id) {
  const t = timers.get(id);
  if (t) clearInterval(t);
  timers.delete(id);
}
export function isRunning(id) {
  return timers.has(id);
}
