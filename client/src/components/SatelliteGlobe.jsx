import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import indiaMap from '@svg-maps/india';

function positionFor(latitude, longitude, radius) {
  const phi = ((90 - latitude) * Math.PI) / 180;
  const theta = ((longitude + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function addGrid(scene) {
  const grid = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x2d6683,
    transparent: true,
    opacity: 0.32,
  });
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const points = [];
    for (let longitude = -180; longitude <= 180; longitude += 5)
      points.push(positionFor(latitude, longitude, 1.006));
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }
  for (let longitude = -180; longitude < 180; longitude += 30) {
    const points = [];
    for (let latitude = -90; latitude <= 90; latitude += 5)
      points.push(positionFor(latitude, longitude, 1.006));
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }
  scene.add(grid);
}

function addBoundaries(scene) {
  const boundaries = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x8ed7df,
    transparent: true,
    opacity: 0.7,
  });
  const countries = feature(world, world.objects.countries);

  countries.features.forEach((country) => {
    if (country.properties?.name === 'India' || country.properties?.name === 'Pakistan') return;
    const polygons =
      country.geometry.type === 'Polygon'
        ? [country.geometry.coordinates]
        : country.geometry.coordinates;
    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        const points = ring.map(([longitude, latitude]) => positionFor(latitude, longitude, 1.012));
        boundaries.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
      });
    });
  });
  scene.add(boundaries);
}

function indiaPathParts(path) {
  const tokens = [...path.matchAll(/([mlz])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/gi)];
  const parts = [];
  let current = [0, 0];
  let command = '';
  let part = [];
  let index = 0;
  while (index < tokens.length) {
    const commandToken = tokens[index][1];
    if (commandToken) {
      command = commandToken;
      index += 1;
      if (command.toLowerCase() === 'z') {
        if (part.length) parts.push(part);
        part = [];
      }
      continue;
    }
    if (!/[ml]/i.test(command) || index + 1 >= tokens.length) break;
    const x = Number(tokens[index][2]);
    const y = Number(tokens[index + 1][2]);
    const relative = command === command.toLowerCase();
    current = relative ? [current[0] + x, current[1] + y] : [x, y];
    if (command.toLowerCase() === 'm' && part.length) {
      parts.push(part);
      part = [];
    }
    part.push(current);
    if (command.toLowerCase() === 'm') command = relative ? 'l' : 'L';
    index += 2;
  }
  if (part.length) parts.push(part);
  return parts;
}

function addIndiaMap(scene) {
  const boundaries = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0xffb347,
    transparent: true,
    opacity: 0.9,
  });
  indiaMap.locations.forEach(({ path }) => {
    indiaPathParts(path).forEach((part) => {
      const points = part.map(([x, y]) =>
        positionFor(37.5 - (y / 696) * 31, 68 + (x / 612) * 29.5, 1.016),
      );
      if (points.length > 1)
        boundaries.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
    });
  });
  scene.add(boundaries);
}

function clearMarkers(group) {
  group.children.forEach((child) => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
    else child.material?.dispose();
  });
  group.clear();
}

export default function SatelliteGlobe({ satellites = [] }) {
  const ref = useRef();
  const markerGroupRef = useRef();
  const [selectedSatellite, setSelectedSatellite] = useState(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06111c);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.25, 3.1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ref.current.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1.55;
    controls.maxDistance = 4.8;
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        new THREE.MeshPhongMaterial({ color: 0x12354a, emissive: 0x06121d, shininess: 16 }),
      ),
    );
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.035, 48, 48),
        new THREE.MeshBasicMaterial({
          color: 0x36b8d4,
          transparent: true,
          opacity: 0.08,
          side: THREE.BackSide,
        }),
      ),
    );
    addGrid(scene);
    addBoundaries(scene);
    addIndiaMap(scene);
    scene.add(new THREE.AmbientLight(0x8db6c8, 1.6));
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(3, 4, 4);
    scene.add(light);
    const markerGroup = new THREE.Group();
    markerGroupRef.current = markerGroup;
    scene.add(markerGroup);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const handlePointerDown = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster
        .intersectObjects(markerGroup.children, false)
        .find((intersection) => intersection.object.userData.satellite);
      setSelectedSatellite(hit?.object.userData.satellite || null);
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    const resize = () => {
      const { width, height } = ref.current.getBoundingClientRect();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(ref.current);
    resize();
    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      clearMarkers(markerGroup);
      renderer.dispose();
      ref.current?.removeChild(renderer.domElement);
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material))
          object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      markerGroupRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const group = markerGroupRef.current;
    if (!group) return;
    clearMarkers(group);
    satellites
      .filter((satellite) => satellite.lastPosition)
      .forEach((satellite, index) => {
        const { latitude, longitude, altitude = 0 } = satellite.lastPosition;
        const radius = 1.04 + Math.min(Math.max(Number(altitude) / 10000, 0.03), 0.18);
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.026, 12, 12),
          new THREE.MeshBasicMaterial({ color: index % 2 ? 0xffc857 : 0x55e6c1 }),
        );
        marker.userData.satellite = satellite;
        marker.position.copy(positionFor(Number(latitude), Number(longitude), radius));
        group.add(marker);
        const hitArea = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 12, 12),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
        );
        hitArea.userData.satellite = satellite;
        hitArea.position.copy(marker.position);
        group.add(hitArea);
        group.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              positionFor(Number(latitude), Number(longitude), 1.01),
              marker.position,
            ]),
            new THREE.LineBasicMaterial({ color: 0x62d8e8, transparent: true, opacity: 0.5 }),
          ),
        );
      });
  }, [satellites]);

  return (
    <div className="globe-shell">
      <div ref={ref} className="globe" />
      {selectedSatellite && (
        <div className="globe-selection">
          <strong>{selectedSatellite.name}</strong>
          <span>NORAD {selectedSatellite.noradId}</span>
        </div>
      )}
    </div>
  );
}
