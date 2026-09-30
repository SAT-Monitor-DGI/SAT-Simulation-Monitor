const BASE = 'https://celestrak.org/NORAD/elements/gp.php';
async function getJson(noradId) {
  const r = await fetch(`${BASE}?CATNR=${encodeURIComponent(noradId)}&FORMAT=JSON`);
  if (!r.ok) throw new Error(`CelesTrak returned ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data) || !data.length) throw new Error('Satellite not found');
  return data[0];
}
async function getTle(noradId) {
  if (Number(noradId) > 99999) return null;
  const r = await fetch(`${BASE}?CATNR=${encodeURIComponent(noradId)}&FORMAT=TLE`);
  if (!r.ok) return null;
  const text = await r.text();
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length < 3) return null;
  return { name: lines[0], line1: lines[1], line2: lines[2] };
}
export async function importNorad(noradId) {
  if (!/^\d{1,9}$/.test(String(noradId))) throw new Error('NORAD ID must be 1-9 digits');
  const raw = await getJson(noradId);
  const tle = await getTle(noradId);
  return { raw, tle };
}
