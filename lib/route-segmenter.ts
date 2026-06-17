/**
 * Route Segmenter — splits an SVG path into 9 equal-length segments
 * and maps them to the 3x3 grid coordinate system.
 */

interface Point {
  x: number;
  y: number;
}

interface SegmentResult {
  index: number;        // 0-8
  gridRow: number;      // 0-2
  gridCol: number;      // 0-2
  points: Point[];      // Points in local 1080x1080 coordinate space
  pathData: string;     // SVG path d attribute for this segment (local coords)
}

/** Parse an SVG path 'd' string into an array of sampled points */
function parsePathToPoints(pathData: string, numSamples: number = 5000): Point[] {
  const points: Point[] = [];
  const commands = pathData.trim().replace(/\s+/g, ' ').match(/[MLCZQTSA][^MLCZQTSA]*/gi);
  if (!commands) return points;

  let currentX = 0;
  let currentY = 0;
  let firstX = 0;
  let firstY = 0;

  for (const cmd of commands) {
    const type = cmd[0].toUpperCase();
    const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

    switch (type) {
      case 'M': {
        currentX = args[0];
        currentY = args[1];
        firstX = currentX;
        firstY = currentY;
        points.push({ x: currentX, y: currentY });
        break;
      }
      case 'L': {
        for (let i = 0; i < args.length; i += 2) {
          const prevX = currentX;
          const prevY = currentY;
          currentX = args[i];
          currentY = args[i + 1];
          // Interpolate intermediate points for smooth rendering
          const subSteps = 30;
          for (let s = 1; s <= subSteps; s++) {
            const t = s / subSteps;
            points.push({
              x: Math.round(prevX + (currentX - prevX) * t),
              y: Math.round(prevY + (currentY - prevY) * t),
            });
          }
        }
        break;
      }
      case 'Z': {
        // Close path: draw line back to the first point
        if (currentX !== firstX || currentY !== firstY) {
          const prevX = currentX;
          const prevY = currentY;
          currentX = firstX;
          currentY = firstY;
          const subSteps = 30;
          for (let s = 1; s <= subSteps; s++) {
            const t = s / subSteps;
            points.push({
              x: Math.round(prevX + (currentX - prevX) * t),
              y: Math.round(prevY + (currentY - prevY) * t),
            });
          }
        }
        break;
      }
      case 'C': {
        const samples = 50;
        for (let i = 0; i < args.length; i += 6) {
          const x1 = args[i], y1 = args[i + 1];
          const x2 = args[i + 2], y2 = args[i + 3];
          const x3 = args[i + 4], y3 = args[i + 5];
          const startX = currentX, startY = currentY;
          for (let t = 1; t <= samples; t++) {
            const u = t / samples;
            const u1 = 1 - u;
            const px = u1*u1*u1*startX + 3*u1*u1*u*x1 + 3*u1*u*u*x2 + u*u*u*x3;
            const py = u1*u1*u1*startY + 3*u1*u1*u*y1 + 3*u1*u*u*y2 + u*u*u*y3;
            points.push({ x: Math.round(px), y: Math.round(py) });
          }
          currentX = x3;
          currentY = y3;
        }
        break;
      }
      default:
        break;
    }
  }

  if (points.length > numSamples) {
    const step = Math.floor(points.length / numSamples);
    return points.filter((_, i) => i % step === 0);
  }
  return points;
}

/** Calculate cumulative distances along the path */
function computeCumulativeDistances(points: Point[]): number[] {
  const distances: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    distances.push(distances[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return distances;
}

/**
 * Split the route into 9 segments of equal arc length.
 * Each segment is mapped to local 1080x1080 coordinates for its grid cell.
 */
export function segmentRoute(pathData: string): SegmentResult[] {
  const CANVAS = 3240;
  const CELL = 1080;

  const points = parsePathToPoints(pathData);
  const cumDist = computeCumulativeDistances(points);
  const totalLength = cumDist[cumDist.length - 1];

  if (totalLength < 1 || points.length < 2) {
    // Fallback: return empty segments
    return Array.from({ length: 9 }, (_, i) => ({
      index: i,
      gridRow: Math.floor(i / 3),
      gridCol: i % 3,
      points: [],
      pathData: '',
    }));
  }

  const segmentLength = totalLength / 9;
  const segments: SegmentResult[] = [];

  for (let seg = 0; seg < 9; seg++) {
    const segStart = seg * segmentLength;
    const segEnd = (seg + 1) * segmentLength;
    const segPoints: Point[] = [];

    // Find points within this segment
    for (let i = 0; i < points.length; i++) {
      const d = cumDist[i];
      if (d >= segStart && d <= segEnd) {
        segPoints.push(points[i]);
      }
    }

    // Include boundary points
    if (segPoints.length === 0) {
      // Find the closest point
      let closest = 0;
      let minDist = Infinity;
      for (let i = 0; i < points.length; i++) {
        const d = Math.abs(cumDist[i] - (segStart + segEnd) / 2);
        if (d < minDist) { minDist = d; closest = i; }
      }
      segPoints.push(points[closest]);
    }

    const gridRow = Math.floor(seg / 3);
    const gridCol = seg % 3;
    const offsetX = gridCol * CELL;
    const offsetY = gridRow * CELL;

    // Map to local coordinates
    const localPoints = segPoints.map(p => ({
      x: p.x - offsetX,
      y: p.y - offsetY,
    }));

    // Build local path data
    let pathData = '';
    if (localPoints.length > 0) {
      pathData = `M ${localPoints[0].x} ${localPoints[0].y}`;
      for (let i = 1; i < localPoints.length; i++) {
        pathData += ` L ${localPoints[i].x} ${localPoints[i].y}`;
      }
    }

    segments.push({
      index: seg,
      gridRow,
      gridCol,
      points: localPoints,
      pathData,
    });
  }

  return segments;
}
