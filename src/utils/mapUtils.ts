import { Friend, MapBounds, MapViewport } from '../types';

// 中国地图边界
export const CHINA_BOUNDS: MapBounds = {
  north: 53.5,
  south: 18.2,
  east: 134.8,
  west: 73.5
};

// 世界地图边界
export const WORLD_BOUNDS: MapBounds = {
  north: 85,
  south: -85,
  east: 180,
  west: -180
};

// 默认视口配置
export const DEFAULT_WORLD_VIEWPORT: MapViewport = {
  center: [20, 0],
  zoom: 2
};

export const DEFAULT_CHINA_VIEWPORT: MapViewport = {
  center: [35, 105],
  zoom: 4
};

// 判断坐标是否在中国境内
export const isInChina = (lat: number, lng: number): boolean => {
  return lat >= CHINA_BOUNDS.south && 
         lat <= CHINA_BOUNDS.north && 
         lng >= CHINA_BOUNDS.west && 
         lng <= CHINA_BOUNDS.east;
};

// 过滤中国朋友
export const getChinaFriends = (friends: Friend[]): Friend[] => {
  return friends.filter(friend => isInChina(friend.latitude, friend.longitude));
};

// 过滤世界朋友
export const getWorldFriends = (friends: Friend[]): Friend[] => {
  return friends;
};

// 获取地图中心点
export const getMapCenter = (friends: Friend[]): [number, number] => {
  if (friends.length === 0) return [0, 0];
  
  const totalLat = friends.reduce((sum, friend) => sum + friend.latitude, 0);
  const totalLng = friends.reduce((sum, friend) => sum + friend.longitude, 0);
  
  return [totalLat / friends.length, totalLng / friends.length];
};

export function calculateMarkerPosition(latitude: number, longitude: number, mapWidth: number, mapHeight: number): { x: number; y: number } {
    const x = (longitude + 180) * (mapWidth / 360);
    const y = (90 - latitude) * (mapHeight / 180);
    return { x, y };
}

export function getMapZoomLevel(scale: number): number {
    return Math.log2(scale) + 1;
}

export function getFriendLocation(friend: { province: string; city: string; address?: string }): string {
    return `${friend.province}, ${friend.city}${friend.address ? ', ' + friend.address : ''}`;
}