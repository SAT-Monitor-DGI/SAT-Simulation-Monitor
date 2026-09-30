import * as satellite from 'satellite.js';
export function propagate(tle, date = new Date()) {
  if (!tle?.line1 || !tle?.line2) throw new Error('TLE unavailable for SGP4 simulation');
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
  const pv = satellite.propagate(satrec, date);
  if (!pv?.position) throw new Error(`Propagation failed: ${satrec.error}`);
  const gmst = satellite.gstime(date);
  const gd = satellite.eciToGeodetic(pv.position, gmst);
  const velocity = Math.sqrt(pv.velocity.x ** 2 + pv.velocity.y ** 2 + pv.velocity.z ** 2);
  return {
    latitude: satellite.radiansToDegrees(gd.latitude),
    longitude: satellite.radiansToDegrees(gd.longitude),
    altitude: gd.height,
    velocity,
  };
}
