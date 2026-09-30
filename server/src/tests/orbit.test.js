import { propagate } from '../services/orbitService.js';
test('propagates a valid TLE', () => {
  const p = propagate(
    {
      line1: '1 25544U 98067A   24173.52992014  .00014423  00000+0  25933-3 0  9994',
      line2: '2 25544  51.6393  21.0261 0003447  72.1587  40.0861 15.50922710457820',
    },
    new Date('2024-06-21T12:00:00Z'),
  );
  expect(p.latitude).toEqual(expect.any(Number));
  expect(p.longitude).toEqual(expect.any(Number));
  expect(p.altitude).toBeGreaterThan(100);
});
