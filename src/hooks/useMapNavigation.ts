import { useRef, useCallback } from 'react';
import { Friend } from '../types';

export interface MapRef {
  flyTo: (lat: number, lng: number) => void;
  setView: (lat: number, lng: number, zoom?: number) => void;
  getZoom: () => number;
  getBounds: () => any;
}

export const useMapNavigation = (activeMap: 'world' | 'china') => {
  const worldMapRef = useRef<MapRef>(null);
  const chinaMapRef = useRef<MapRef>(null);

  const flyToFriend = useCallback((friend: Friend) => {
    const currentMapRef = activeMap === 'world' ? worldMapRef : chinaMapRef;
    
    if (currentMapRef.current && friend.latitude && friend.longitude) {
      try {
        currentMapRef.current.flyTo(friend.latitude, friend.longitude);
        
        // 可以添加一些用户反馈
        console.log(`飞到 ${friend.name} 的位置: ${friend.city}, ${friend.province}`);
      } catch (error) {
        console.error('导航到朋友位置时出错:', error);
      }
    }
  }, [activeMap]);

  const getCurrentMapBounds = useCallback(() => {
    const currentMapRef = activeMap === 'world' ? worldMapRef : chinaMapRef;
    return currentMapRef.current?.getBounds();
  }, [activeMap]);

  const getCurrentZoom = useCallback(() => {
    const currentMapRef = activeMap === 'world' ? worldMapRef : chinaMapRef;
    return currentMapRef.current?.getZoom() || 2;
  }, [activeMap]);

  return {
    worldMapRef,
    chinaMapRef,
    flyToFriend,
    getCurrentMapBounds,
    getCurrentZoom,
  };
};