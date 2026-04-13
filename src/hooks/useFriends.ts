import { useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { Friend } from '../types';

interface FilterOptions {
  searchQuery: string;
  selectedRegion: string;
  selectedTag?: string;
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

    // 标签筛选
    if (options.selectedTag && options.selectedTag !== 'all') {
      filtered = filtered.filter(friend =>
        friend.tags && friend.tags.includes(options.selectedTag!)
      );
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
  }, [friends, options.selectedRegion, options.selectedTag, debouncedSearchQuery]);

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(friends.map(friend => friend.province)));
    return uniqueRegions.sort();
  }, [friends]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    friends.forEach(f => f.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [friends]);

  const stats = useMemo(() => ({
    totalCount: friends.length,
    filteredCount: filteredData.length,
    regionCount: regions.length,
  }), [friends.length, filteredData.length, regions.length]);

  return {
    filteredFriends: filteredData,
    regions,
    allTags,
    ...stats,
  };
};
