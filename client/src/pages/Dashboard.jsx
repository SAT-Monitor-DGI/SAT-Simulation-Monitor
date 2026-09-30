import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TelemetryCard from '../components/TelemetryCard';
import SatelliteMap from '../components/SatelliteMap';
import SatelliteGlobe from '../components/SatelliteGlobe';
import '../dashboard.css';
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sats, setSats] = useState([]);
  const [norad, setNorad] = useState('25544');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('map');
  async function load() {
    const r = await api.get('/satellites');
    setSats(r.data);
    if (selected) setSelected(r.data.find((x) => x._id === selected._id) || null);
  }
  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);
  async function importSat(e) {
    e.preventDefault();
    setMessage('Fetching CelesTrak...');
    try {
      const r = await api.post('/satellites/import', { noradId: norad });
      setMessage(
        `${r.data.satellite.name} imported${r.data.simulatable ? ' - SGP4 available.' : ' - TLE unavailable for simulation.'}`,
      );
      setSelected(r.data.satellite);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Import failed');
    }
  }
  async function simulate(id, enabled) {
    try {
      await api.post(`/satellites/${id}/simulate`, { enabled });
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Simulation failed');
    }
  }
  const s = selected || sats[0];
  return (
    <main>
      <header>
        <div>
          <strong>Mission Control</strong>
          <span className="muted"> Ground Control Simulation Platform</span>
        </div>
        <div>
          {user.username} · {user.role}{' '}
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <section className="toolbar">
        <form onSubmit={importSat}>
          <input
            value={norad}
            onChange={(e) => setNorad(e.target.value)}
            placeholder="NORAD Catalog ID"
          />
          <button>Import Satellite</button>
        </form>
        {message && <span className="muted">{message}</span>}
      </section>
      <div className="layout">
        <section>
          <div className="panel">
            <div className="section-title">
              <h2>Satellites</h2>
              <span>{sats.length} tracked</span>
            </div>
            {sats.map((x) => (
              <button
                className={`sat-row ${s?._id === x._id ? 'selected' : ''}`}
                key={x._id}
                onClick={() => setSelected(x)}
              >
                <span>● {x.name}</span>
                <small>
                  NORAD {x.noradId} · {x.source}
                </small>
              </button>
            ))}
          </div>
          <div className="panel">
            <h2>Telemetry</h2>
            {s ? (
              <TelemetryCard
                temperature={35}
                battery={82}
                altitude={s.lastPosition?.altitude || 0}
                signal={92}
              />
            ) : (
              <p className="muted">Import a satellite to begin.</p>
            )}
            {s && (
              <div className="actions">
                <button onClick={() => simulate(s._id, !s.simulation?.enabled)}>
                  {s.simulation?.enabled ? 'Stop simulation' : 'Start simulation'}
                </button>
                {s.lastPosition && (
                  <span className="muted">
                    {s.lastPosition.latitude.toFixed(2)}°, {s.lastPosition.longitude.toFixed(2)}°
                  </span>
                )}
              </div>
            )}
          </div>
        </section>
        <section>
          <div className="panel map-panel">
            <div className="section-title">
              <h2>Orbital Ground View</h2>
              <div className="view-switch" role="group" aria-label="Map view">
                <button
                  type="button"
                  className={view === 'map' ? 'active' : ''}
                  onClick={() => setView('map')}
                >
                  Map
                </button>
                <button
                  type="button"
                  className={view === 'globe' ? 'active' : ''}
                  onClick={() => setView('globe')}
                >
                  3D Globe
                </button>
              </div>
            </div>
            {view === 'map' ? (
              <SatelliteMap satellites={sats} />
            ) : (
              <SatelliteGlobe satellites={sats} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
