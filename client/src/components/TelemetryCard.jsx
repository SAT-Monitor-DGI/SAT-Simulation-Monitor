export default function TelemetryCard({ temperature = 0, battery = 0, altitude = 0, signal = 0 }) {
  return (
    <div className="telemetry-grid">
      <div>
        <span>Temperature</span>
        <b>{Number(temperature).toFixed(1)}°C</b>
      </div>
      <div>
        <span>Battery</span>
        {/* <b>{Number(battery).toFixed(0)}%</b> */}
        <b>Unknown %</b>
      </div>
      <div>
        <span>Altitude</span>
        <b>{Number(altitude).toFixed(1)} km</b>
      </div>
      <div>
        <span>Signal</span>
        <b>Unknown %</b>
        {/* <b>{Number(signal).toFixed(0)}%</b> */}
      </div>
    </div>
  );
}
