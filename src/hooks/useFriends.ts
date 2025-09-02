import { useState, useEffect, useMemo, useRef } from 'react';
import { Friend, MapRef } from '../types';

interface UseFriendsFilterOptions {
  searchQuery: string;
  selectedRegion: string;
}

export const useFriendsFilter = (friends: Friend[], options: UseFriendsFilterOptions) => {
  const { searchQuery, selectedRegion } = options;

  const filteredFriends = useMemo(() => {
    let filtered = friends;

    // 按地区筛选
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(friend => friend.province === selectedRegion);
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(friend => 
        friend.name.toLowerCase().includes(query) ||
        friend.province.toLowerCase().includes(query) ||
        friend.city.toLowerCase().includes(query) ||
        (friend.address && friend.address.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [friends, searchQuery, selectedRegion]);

  const regions = useMemo(() => {
    return Array.from(new Set(friends.map(friend => friend.province))).sort();
  }, [friends]);

  return {
    filteredFriends,
    regions,
    totalCount: friends.length,
    filteredCount: filteredFriends.length
  };
};

export const useMapNavigation = (activeMap: 'world' | 'china') => {
  const worldMapRef = useRef<MapRef>(null);
  const chinaMapRef = useRef<MapRef>(null);

  const flyToFriend = (friend: Friend) => {
    const currentMapRef = activeMap === 'world' ? worldMapRef : chinaMapRef;
    if (currentMapRef.current) {
      currentMapRef.current.flyTo(friend.latitude, friend.longitude, 12);
    }
  };

  return {
    worldMapRef,
    chinaMapRef,
    flyToFriend
  };
};