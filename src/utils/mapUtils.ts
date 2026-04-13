import { MapBounds, MapViewport } from '../types';

// HTML 转义，防止 XSS（纯字符串替换，避免 DOM 创建开销）
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
export const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
};

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
