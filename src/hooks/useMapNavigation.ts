import { useRef, useCallback } from 'react';
import { Friend, MapRef } from '../types';

export const useMapNavigation = () => {
  const mapRef = useRef<MapRef>(null);

  const flyToFriend = useCallback((friend: Friend) => {
    if (!mapRef.current) {
      console.warn('地图正在加载，请稍后再试');
      return;
    }
    if (friend.latitude && friend.longitude) {
      try {
        mapRef.current.flyTo(friend.latitude, friend.longitude);
      } catch (error) {
        console.error('导航到朋友位置时出错:', error);
      }
    }
  }, []);

  return {
    mapRef,
    flyToFriend,
  };
};
