import { create } from 'xmlbuilder2';
import type { ActivityPoint } from '../types/activity';
import { ActivityType } from '../types/activity';
import { SPORT_PROFILES } from '../sport-profiles';

export function exportGPX(points: ActivityPoint[], activityType: ActivityType = ActivityType.Running) {
  if (!points || points.length === 0) return;

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('gpx', {
      creator: 'StravaFakeRun',
      version: '1.1',
      xmlns: 'http://www.topografix.com/GPX/1/1',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
      'xmlns:gpxtpx': 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1'
    });

  const trk = root.ele('trk');
  const profile = SPORT_PROFILES[activityType];
  trk.ele('name').txt(`Fake ${activityType}`);
  trk.ele('type').txt(profile.gpxType);
  const trkseg = trk.ele('trkseg');

  points.forEach((p) => {
    const trkpt = trkseg.ele('trkpt', { lat: p.lat.toString(), lon: p.lon.toString() });
    
    if (p.elevation !== undefined) {
      trkpt.ele('ele').txt(p.elevation.toString());
    }
    
    trkpt.ele('time').txt(p.timestamp);

    // Optional biometric extensions
    if (p.heartRate !== undefined || p.cadence !== undefined) {
      const extensions = trkpt.ele('extensions');
      const tpx = extensions.ele('gpxtpx:TrackPointExtension');
      
      if (p.heartRate !== undefined) {
        tpx.ele('gpxtpx:hr').txt(Math.round(p.heartRate).toString());
      }
      
      if (p.cadence !== undefined) {
        tpx.ele('gpxtpx:cad').txt(Math.round(p.cadence).toString());
      }
    }
  });

  const xmlString = root.end({ prettyPrint: true });
  
  // Handle Tauri (Desktop) Save
  const isTauri = typeof window !== 'undefined' && (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  
  if (isTauri) {
    (async () => {
      try {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeTextFile } = await import('@tauri-apps/plugin-fs');
        
        const path = await save({
          defaultPath: `fake-${profile.gpxType}.gpx`,
          filters: [{ name: 'GPX', extensions: ['gpx'] }]
        });
        
        if (path) {
          await writeTextFile(path, xmlString);
          console.log('GPX saved to:', path);
        }
      } catch (err) {
        console.error('Failed to save GPX via Tauri:', err);
      }
    })();
    return;
  }

  // Trigger browser download fallback
  const blob = new Blob([xmlString], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fake-${profile.gpxType}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
