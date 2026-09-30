import Alert from '../models/Alert.js';
export async function evaluateAlerts(satelliteId, m) {
  const out = [];
  if (m.battery < 20) out.push(['battery', 'critical', 'Battery below 20%']);
  else if (m.battery < 35) out.push(['battery', 'warning', 'Battery below 35%']);
  if (m.temperature > 80) out.push(['temperature', 'critical', 'Temperature above 80°C']);
  else if (m.temperature > 65) out.push(['temperature', 'warning', 'Temperature above 65°C']);
  for (const [type, severity, message] of out)
    await Alert.create({ satelliteId, type, severity, message });
  return out;
}
