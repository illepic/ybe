// Approach routes for the "How to get there" map. Each route's full road
// geometry is its own GeoJSON file (driving directions from OSRM); `directions`
// are the major maneuvers, shown in the panel and pinned on the map.
// Vancouver + Portland are forced via the southern (Reilly/Livingston) approach
// so they avoid the closed NE Rawson Rd.
import camasLine from './routes/camas.json';
import battleGroundLine from './routes/battle-ground.json';
import vancouverLine from './routes/vancouver.json';
import portlandLine from './routes/portland.json';
import hoodRiverLine from './routes/hood-river.json';
import rawsonAvoid from './routes/rawson-avoid.json';

export interface RouteLine {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties?: Record<string, unknown>;
}

export interface RouteTurn {
  /** Where the turn happens, GeoJSON order [longitude, latitude]. */
  at: [number, number];
  /** OSRM maneuver modifier — 'left' | 'right' | 'slight left' | ... (drives the arrow). */
  modifier: string;
  /** Road being turned onto, e.g. "NE Reilly Rd". */
  road: string;
  /** Full instruction for the list, e.g. "Turn right onto NE Reilly Rd". */
  text: string;
}

export interface GettingThereRoute {
  id: string;
  label: string;
  line: RouteLine;
  /** Major turns along the route — listed in the panel and pinned on the map. */
  directions?: RouteTurn[];
}

/** NE Rawson Rd, from its start to the start of L-1400 — the section to avoid. */
export const RAWSON_AVOID = rawsonAvoid as unknown as RouteLine;

export const GETTING_THERE_ROUTES: GettingThereRoute[] = [
  {
    id: 'portland',
    label: 'Portland',
    // Forced via the southern (Reilly/Livingston) approach to avoid NE Rawson Rd.
    line: portlandLine as unknown as RouteLine,
    directions: [
      {
        at: [-122.67518, 45.51892],
        modifier: 'left',
        road: 'SW Alder St',
        text: 'Turn left onto SW Alder St',
      },
      {
        at: [-122.6742, 45.51866],
        modifier: 'slight left',
        road: 'Morrison Bridge',
        text: 'Take the Morrison Bridge across the Willamette',
      },
      {
        at: [-122.66552, 45.52155],
        modifier: 'straight',
        road: 'I-5',
        text: 'Merge onto I-5 North',
      },
      {
        at: [-122.66169, 45.64464],
        modifier: 'slight right',
        road: 'WA-500',
        text: 'Take the WA-500 exit east toward Orchards',
      },
      {
        at: [-122.55251, 45.6668],
        modifier: 'right',
        road: 'NE Fourth Plain Blvd',
        text: 'Turn right onto NE Fourth Plain Blvd (WA-500)',
      },
      {
        at: [-122.48876, 45.67184],
        modifier: 'straight',
        road: 'NE Fourth Plain Blvd',
        text: 'At the roundabout, stay on NE Fourth Plain Blvd',
      },
      {
        at: [-122.42987, 45.66227],
        modifier: 'slight right',
        road: 'NE 237th Ave',
        text: 'Keep slight right onto NE 237th Ave',
      },
      {
        at: [-122.42954, 45.6614],
        modifier: 'left',
        road: 'NE 53rd St',
        text: 'Turn left onto NE 53rd St',
      },
      {
        at: [-122.33698, 45.71167],
        modifier: 'slight right',
        road: 'L-1000N Rd',
        text: 'Turn slight right onto L-1000N Rd',
      },
    ],
  },
  {
    id: 'vancouver',
    label: 'Vancouver',
    // Forced via the southern (Reilly/Livingston) approach to avoid NE Rawson Rd.
    line: vancouverLine as unknown as RouteLine,
    directions: [
      {
        at: [-122.6726, 45.63183],
        modifier: 'straight',
        road: 'W Mill Plain Blvd',
        text: 'Start on W Mill Plain Blvd toward I-5',
      },
      {
        at: [-122.66257, 45.63526],
        modifier: 'straight',
        road: 'I-5',
        text: 'Merge onto I-5 North',
      },
      {
        at: [-122.66169, 45.64464],
        modifier: 'slight right',
        road: 'WA-500',
        text: 'Take the WA-500 exit east toward Orchards',
      },
      {
        at: [-122.55251, 45.6668],
        modifier: 'right',
        road: 'NE Fourth Plain Blvd',
        text: 'Turn right onto NE Fourth Plain Blvd (WA-500)',
      },
      {
        at: [-122.48876, 45.67184],
        modifier: 'straight',
        road: 'NE Fourth Plain Blvd',
        text: 'At the roundabout, stay on NE Fourth Plain Blvd',
      },
      {
        at: [-122.42987, 45.66227],
        modifier: 'slight right',
        road: 'NE 237th Ave',
        text: 'Keep slight right onto NE 237th Ave',
      },
      {
        at: [-122.42954, 45.6614],
        modifier: 'left',
        road: 'NE 53rd St',
        text: 'Turn left onto NE 53rd St',
      },
      {
        at: [-122.33698, 45.71167],
        modifier: 'slight right',
        road: 'L-1000N Rd',
        text: 'Turn slight right onto L-1000N Rd',
      },
    ],
  },
  {
    id: 'battle-ground',
    label: 'Battle Ground',
    // Real driving route (downtown Battle Ground → trailhead) via OSRM, full road geometry.
    line: battleGroundLine as unknown as RouteLine,
    directions: [
      {
        at: [-122.5343, 45.78089],
        modifier: 'right',
        road: 'East Main St',
        text: 'Turn right onto East Main St',
      },
      {
        at: [-122.5292, 45.78096],
        modifier: 'left',
        road: 'NE Grace Ave',
        text: 'Turn left onto NE Grace Ave',
      },
      {
        at: [-122.52681, 45.8058],
        modifier: 'slight right',
        road: 'NE Axford Rd',
        text: 'Keep slight right onto NE Axford Rd',
      },
      {
        at: [-122.49559, 45.82454],
        modifier: 'left',
        road: 'NE 172nd Ave',
        text: 'Turn left onto NE 172nd Ave',
      },
      {
        at: [-122.49432, 45.83452],
        modifier: 'right',
        road: 'NE Lucia Falls Rd',
        text: 'At the end of the road, turn right onto NE Lucia Falls Rd',
      },
      {
        at: [-122.38511, 45.83434],
        modifier: 'right',
        road: 'NE Sunset Falls Rd',
        text: 'Turn right onto NE Sunset Falls Rd',
      },
      {
        at: [-122.35602, 45.8184],
        modifier: 'right',
        road: 'NE Dole Valley Rd',
        text: 'Turn right onto NE Dole Valley Rd',
      },
    ],
  },
  {
    id: 'camas',
    label: 'Camas',
    // Real driving route (downtown Camas → trailhead) via OSRM, full road geometry.
    line: camasLine as unknown as RouteLine,
    directions: [
      {
        at: [-122.40314, 45.58984],
        modifier: 'slight left',
        road: 'NE 14th Ave',
        text: 'Turn slight left onto NE 14th Ave',
      },
      {
        at: [-122.40557, 45.5899],
        modifier: 'right',
        road: 'NE Everett St',
        text: 'Turn right onto NE Everett St',
      },
      {
        at: [-122.4065, 45.60208],
        modifier: 'slight right',
        road: 'NE Everett St',
        text: 'At the roundabout, stay on NE Everett St',
      },
      {
        at: [-122.39966, 45.62356],
        modifier: 'slight left',
        road: 'NE 267th Ave',
        text: 'Keep slight left onto NE 267th Ave',
      },
      {
        at: [-122.39867, 45.63695],
        modifier: 'right',
        road: 'NE 19th St',
        text: 'Turn right onto NE 19th St',
      },
      {
        at: [-122.38304, 45.635],
        modifier: 'left',
        road: 'NE Reilly Rd',
        text: 'Turn left onto NE Reilly Rd',
      },
      {
        at: [-122.3747, 45.66156],
        modifier: 'right',
        road: 'NE Livingston Rd',
        text: 'Turn right onto NE Livingston Rd',
      },
      {
        at: [-122.33698, 45.71167],
        modifier: 'slight right',
        road: 'L-1000N Rd',
        text: 'Turn slight right onto L-1000N Rd',
      },
    ],
  },
  {
    id: 'hood-river',
    label: 'Hood River',
    // Real driving route (downtown Hood River → trailhead) via OSRM, full road
    // geometry. Crosses at the Bridge of the Gods, then up via Reilly/Livingston.
    line: hoodRiverLine as unknown as RouteLine,
    directions: [
      {
        at: [-121.51677, 45.7122],
        modifier: 'slight left',
        road: 'Columbia River Hwy',
        text: 'Merge onto Columbia River Hwy (I-84) heading west',
      },
      {
        at: [-121.89781, 45.66242],
        modifier: 'left',
        road: 'Bridge of the Gods',
        text: 'Turn left to cross the Bridge of the Gods (toll)',
      },
      {
        at: [-121.90526, 45.66303],
        modifier: 'left',
        road: 'Evergreen Hwy',
        text: 'Turn left onto Evergreen Hwy (WA-14) heading west',
      },
      {
        at: [-122.35599, 45.57677],
        modifier: 'straight',
        road: 'Washougal River Rd',
        text: 'At the roundabout, take Washougal River Rd',
      },
      {
        at: [-122.34434, 45.60725],
        modifier: 'left',
        road: 'SE Blair Rd',
        text: 'Turn left onto SE Blair Rd',
      },
      {
        at: [-122.38304, 45.635],
        modifier: 'right',
        road: 'NE Reilly Rd',
        text: 'Turn right onto NE Reilly Rd',
      },
      {
        at: [-122.3747, 45.66156],
        modifier: 'right',
        road: 'NE Livingston Rd',
        text: 'Turn right onto NE Livingston Rd',
      },
      {
        at: [-122.33698, 45.71167],
        modifier: 'slight right',
        road: 'L-1000N Rd',
        text: 'Turn slight right onto L-1000N Rd',
      },
    ],
  },
];
