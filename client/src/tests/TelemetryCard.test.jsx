import { render, screen } from '@testing-library/react';
import TelemetryCard from '../components/TelemetryCard';
test('renders telemetry values', () => {
  render(<TelemetryCard temperature={28} battery={87} altitude={420} signal={95} />);
  expect(screen.getByText('28.0°C')).toBeInTheDocument();
  expect(screen.getByText('87%')).toBeInTheDocument();
  expect(screen.getByText('420.0 km')).toBeInTheDocument();
});
