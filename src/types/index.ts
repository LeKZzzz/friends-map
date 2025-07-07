export interface Friend {
  id: string;
  name: string;
  province: string;
  city: string;
  address?: string;
  latitude: number;
  longitude: number;
  avatar?: string;
  description?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

export interface MapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}