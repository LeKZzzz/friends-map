import { useRef, useCallback } from 'react';
import { Friend, MapRef } from '../types';

export const useMapNavigation = () => {
  const mapRef = useRef<MapRef>(null);

  const flyToFriend = useCallback((friend: Friend) => {
    if (!mapRef.current) {
      console.warn('地图正在加载，请稍后再试');
      return;
    }
    const latitude = Number(friend.latitude);
    const longitude = Number(friend.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      try {
        mapRef.current.flyTo(latitude, longitude);
      } catch (error) {
        console.error('导航到朋友位置时出错:', error);
      }
    } else {
      console.warn('该好友坐标无效，无法定位:', friend.id);
    }
  }, []);

  return {
    mapRef,
    flyToFriend,
  };
};
