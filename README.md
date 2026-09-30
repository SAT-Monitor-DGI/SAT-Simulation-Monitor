# Satellite Management System

A small React and Node.js project for importing, viewing, and simulating satellites by NORAD ID.

## Run

### Server

```bash
cd server
bun install
cp .env.example .env
bun dev
```

The API runs on `http://localhost:5000`. Set `MONGO_URI`, `JWT_SECRET`, and `CORS_ALLOWED_HOST` in `.env`.

### Client

```bash
cd client
bun install
bun dev
```

The frontend runs on `http://localhost:3000`.

## Backend

### Auth controller

The auth controller registers the first admin user, hashes passwords with bcrypt, and logs users in with username and password. Successful login returns a JWT containing the user ID, username, and role.

### Satellite controller

The satellite controller lists and imports satellites using a NORAD ID, stores orbital data and TLE information, starts or stops SGP4 simulation, and returns telemetry and satellite logs.

## MongoDB models

- **User**: username, hashed password, and role (`admin` or `operator`).
- **Satellite**: name, NORAD ID, source, TLE, orbital parameters, simulation state, and latest position.
- **TelemetryLog**: satellite reference, temperature, battery, signal, position, altitude, velocity, and timestamp.

## Frontend

The login page authenticates users and keeps the JWT and user data in browser storage. The dashboard imports satellites, shows telemetry, starts or stops simulation, and displays satellite positions on a Leaflet map or interactive 3D globe with country boundaries.

## Tests

Frontend tests use **Jest** and **React Testing Library** for the login form and telemetry card.

Backend tests use **Jest** and **Supertest** for the health/protected API endpoints and orbit propagation.

```bash
cd client && bun test
cd server && bun test
```

Formatting checks use Prettier:

```bash
bun run lint
```
