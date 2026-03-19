/**
 * Internal link graph for cruise content cross-linking.
 * Builds relationships between ports, ships, destinations, and cruise lines.
 */

import fs from 'fs';
import path from 'path';

const PORTS_DIR = path.join(process.cwd(), 'src/data/generated/ports');
const SHIPS_DIR = path.join(process.cwd(), 'src/data/generated/ships');
const DESTINATIONS_DIR = path.join(process.cwd(), 'src/data/generated/destinations');
const CRUISE_LINES_DIR = path.join(process.cwd(), 'src/data/taxonomy');

interface PortData { slug: string; name: string; country: string; cruiseLinesFromHere?: string[] }
interface ShipData { slug: string; name: string; cruiseLine: string; cruiseLineSlug: string }
interface DestinationData { slug: string; name: string; cruiseLinesOperating?: string[] }
interface CruiseLineData { slug: string; name: string }

function loadJsonDir<T>(dir: string): T[] {
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    return files.map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) as T;
      } catch { return null; }
    }).filter(Boolean) as T[];
  } catch { return []; }
}

export function getPortSlugs(): string[] {
  return loadJsonDir<PortData>(PORTS_DIR).map(p => p.slug);
}

export function getShipSlugs(): string[] {
  return loadJsonDir<ShipData>(SHIPS_DIR).map(s => s.slug);
}

export function getDestinationSlugs(): string[] {
  return loadJsonDir<DestinationData>(DESTINATIONS_DIR).map(d => d.slug);
}

export function getCruiseLineSlugs(): string[] {
  try {
    const raw = fs.readFileSync(path.join(CRUISE_LINES_DIR, 'cruise-lines.json'), 'utf-8');
    const lines = JSON.parse(raw) as CruiseLineData[];
    return lines.map(l => l.slug);
  } catch { return []; }
}

export interface RelatedPort {
  slug: string;
  name: string;
  country: string;
}

export interface RelatedShip {
  slug: string;
  name: string;
  cruiseLine: string;
}

export interface RelatedDestination {
  slug: string;
  name: string;
}

export interface RelatedContent {
  ports: RelatedPort[];
  ships: RelatedShip[];
  destinations: RelatedDestination[];
}

export function getRelatedContentForPort(portSlug: string): RelatedContent {
  const ports = loadJsonDir<PortData>(PORTS_DIR);
  const ships = loadJsonDir<ShipData>(SHIPS_DIR);
  const destinations = loadJsonDir<DestinationData>(DESTINATIONS_DIR);

  const port = ports.find(p => p.slug === portSlug);
  if (!port) return { ports: [], ships: [], destinations: [] };

  // Ships that sail from this port (via cruise lines)
  const portLines = port.cruiseLinesFromHere || [];
  const relatedShips = ships
    .filter(s => portLines.some(cl => s.cruiseLine.toLowerCase().includes(cl.toLowerCase())))
    .slice(0, 4)
    .map(s => ({ slug: s.slug, name: s.name, cruiseLine: s.cruiseLine }));

  // Destinations served from this port
  const portDestinations = (port as any).destinations_served || [];
  const relatedDestinations = destinations
    .filter(d => portDestinations.some((pd: string) => d.name.toLowerCase().includes(pd.toLowerCase()) || pd.toLowerCase().includes(d.name.toLowerCase())))
    .slice(0, 4)
    .map(d => ({ slug: d.slug, name: d.name }));

  return {
    ports: [],
    ships: relatedShips,
    destinations: relatedDestinations,
  };
}

export function getRelatedContentForShip(shipSlug: string): RelatedContent {
  const ports = loadJsonDir<PortData>(PORTS_DIR);
  const ships = loadJsonDir<ShipData>(SHIPS_DIR);
  const destinations = loadJsonDir<DestinationData>(DESTINATIONS_DIR);

  const ship = ships.find(s => s.slug === shipSlug);
  if (!ship) return { ports: [], ships: [], destinations: [] };

  // Other ships from same cruise line
  const relatedShips = ships
    .filter(s => s.cruiseLine === ship.cruiseLine && s.slug !== ship.slug)
    .slice(0, 4)
    .map(s => ({ slug: s.slug, name: s.name, cruiseLine: s.cruiseLine }));

  // Ports this ship sails from
  const shipHomePorts = (ship as any).home_ports || [];
  const relatedPorts = ports
    .filter(p => shipHomePorts.some((hp: string) => p.name.toLowerCase().includes(hp.toLowerCase())))
    .slice(0, 4)
    .map(p => ({ slug: p.slug, name: p.name, country: p.country }));

  return {
    ports: relatedPorts,
    ships: relatedShips,
    destinations: [],
  };
}

export function getRelatedContentForDestination(destSlug: string): RelatedContent {
  const ports = loadJsonDir<PortData>(PORTS_DIR);
  const ships = loadJsonDir<ShipData>(SHIPS_DIR);
  const destinations = loadJsonDir<DestinationData>(DESTINATIONS_DIR);

  const dest = destinations.find(d => d.slug === destSlug);
  if (!dest) return { ports: [], ships: [], destinations: [] };

  // Ships that operate in this destination
  const destLines = dest.cruiseLinesOperating || [];
  const relatedShips = ships
    .filter(s => destLines.some(cl => s.cruiseLine.toLowerCase().includes(cl.toLowerCase())))
    .slice(0, 4)
    .map(s => ({ slug: s.slug, name: s.name, cruiseLine: s.cruiseLine }));

  // Other destinations from same region (similar cruise lines)
  const relatedDestinations = destinations
    .filter(d => d.slug !== dest.slug && d.cruiseLinesOperating?.some(cl => destLines.some(dcl => dcl.toLowerCase().includes(cl.toLowerCase()))))
    .slice(0, 4)
    .map(d => ({ slug: d.slug, name: d.name }));

  return {
    ports: [],
    ships: relatedShips,
    destinations: relatedDestinations,
  };
}
