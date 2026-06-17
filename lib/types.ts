export interface RouteTemplate {
  id: string;
  name: string;
  description: string;
  region: string;
  difficulty: 'easy' | 'medium' | 'hard';
  length: string;
  /** SVG path data in 3240x3240 viewBox — the full route */
  pathData: string;
  /** SVG path data for thumbnail display */
  thumbnailPath: string;
  /** Start place name */
  startName: string;
  /** End place name */
  endName: string;
  /** Total distance in km */
  totalDistance: number;
  /** Elevation gain in meters */
  elevationGain: number;
  /** Which 3x3 cell (0-8) contains the route start */
  startCell: number;
  /** Which 3x3 cell (0-8) contains the route end */
  endCell: number;
}

export interface RouteSegment {
  index: number;
  gridRow: number;
  gridCol: number;
  /** Path data in local 1080x1080 coordinate space */
  pathData: string;
}

export interface PhotoItem {
  id: string;
  dataUrl: string;
  position: number;
}

export interface AppState {
  photos: (PhotoItem | null)[];
  selectedTemplate: RouteTemplate | null;
  routeColor: string;
  routeWidth: number;
  routeOpacity: number;
  isGenerating: boolean;
}

export type AppAction =
  | { type: 'SET_PHOTO'; position: number; photo: PhotoItem }
  | { type: 'REMOVE_PHOTO'; position: number }
  | { type: 'SWAP_PHOTOS'; from: number; to: number }
  | { type: 'SET_TEMPLATE'; template: RouteTemplate }
  | { type: 'SET_ROUTE_COLOR'; color: string }
  | { type: 'SET_ROUTE_WIDTH'; width: number }
  | { type: 'SET_ROUTE_OPACITY'; opacity: number }
  | { type: 'SET_GENERATING'; isGenerating: boolean }
  | { type: 'RESET' };

export const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7',
  '#FF8C42', '#45B7D1', '#00B894', '#FFFFFF',
] as const;

export const GRID_SIZE = 1080;
export const CANVAS_SIZE = 3240;
