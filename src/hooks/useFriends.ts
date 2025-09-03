import { useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { Friend } from '../types';

interface FilterOptions {
  searchQuery: string;
  selectedRegion: string;
}

export const useFriendsFilter = (friends: Friend[], options: FilterOptions) => {
  // 使用防抖优化搜索性能
  const debouncedSearchQuery = useDebounce(options.searchQuery, 300);

  const filteredData = useMemo(() => {
    let filtered = friends;

    // 地区筛选
    if (options.selectedRegion && options.selectedRegion !== 'all') {
      filtered = filtered.filter(friend => friend.province === options.selectedRegion);
    }

    // 搜索筛选（使用防抖后的查询）
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(friend =>
        friend.name.toLowerCase().includes(query) ||
        friend.city.toLowerCase().includes(query) ||
        friend.province.toLowerCase().includes(query) ||
        (friend.address && friend.address.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [friends, options.selectedRegion, debouncedSearchQuery]);

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(friends.map(friend => friend.province)));
    return uniqueRegions.sort();
  }, [friends]);

  const stats = useMemo(() => ({
    totalCount: friends.length,
    filteredCount: filteredData.length,
    regionCount: regions.length,
  }), [friends.length, filteredData.length, regions.length]);

  return {
    filteredFriends: filteredData,
    regions,
    ...stats,
  };
};