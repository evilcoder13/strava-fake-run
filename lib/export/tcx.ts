import { create } from 'xmlbuilder2';
import type { ActivityPoint } from '../types/activity';

export function exportTCX(points: ActivityPoint[]) {
  if (!points || points.length === 0) return;

  const startTime = points[0].timestamp;
  // Calculate total distance securely in meters
  const totalDist = points[points.length - 1].distFromStartKm * 1000;
  
  // Calculate total time in seconds by parsing the first and last timestamps (fallback to known totalSeconds if it was passed, but ISO timestamps are precise)
  const d1 = new Date(points[0].timestamp);
  const d2 = new Date(points[points.length - 1].timestamp);
  const totalSeconds = (d2.getTime() - d1.getTime()) / 1000;

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('TrainingCenterDatabase', {
      'xmlns': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd',
      'xmlns:ns3': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2'
    });

  const activities = root.ele('Activities');
  const activity = activities.ele('Activity', { Sport: 'Running' });
  
  activity.ele('Id').txt(startTime);

  const lap = activity.ele('Lap', { StartTime: startTime });
  lap.ele('TotalTimeSeconds').txt(totalSeconds.toString());
  lap.ele('DistanceMeters').txt(totalDist.toString());
  lap.ele('Calories').txt('0');
  lap.ele('Intensity').txt('Active');
  lap.ele('TriggerMethod').txt('Manual');

  const track = lap.ele('Track');

  points.forEach((p) => {
    const trackpoint = track.ele('Trackpoint');
    trackpoint.ele('Time').txt(p.timestamp);
    
    const pos = trackpoint.ele('Position');
    pos.ele('LatitudeDegrees').txt(p.lat.toString());
    pos.ele('LongitudeDegrees').txt(p.lon.toString());
    
    if (p.elevation !== undefined) {
      trackpoint.ele('AltitudeMeters').txt(p.elevation.toString());
    }
    
    trackpoint.ele('DistanceMeters').txt((p.distFromStartKm * 1000).toString());
    
    if (p.heartRate !== undefined) {
      const hr = trackpoint.ele('HeartRateBpm');
      hr.ele('Value').txt(Math.round(p.heartRate).toString());
    }
    
    if (p.cadence !== undefined) {
      // Strava supports native Cadence directly on the Trackpoint (unlike GPX)
      // Some devices use Extensions -> ns3:TPX -> ns3:RunCadence. Strava prefers both or generic Cadence.
      trackpoint.ele('Cadence').txt(Math.round(p.cadence).toString());
      
      const ext = trackpoint.ele('Extensions');
      const tpx = ext.ele('ns3:TPX');
      tpx.ele('ns3:RunCadence').txt(Math.round(p.cadence).toString());
    }
  });

  const xmlString = root.end({ prettyPrint: true });
  
  // Trigger download
  const blob = new Blob([xmlString], { type: 'application/vnd.garmin.tcx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fake-run.tcx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
