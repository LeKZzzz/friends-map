import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import MapView from './components/MapView';
import FriendItem from './components/FriendItem';
import CustomSelect from './components/CustomSelect';
import ErrorBoundary from './components/ErrorBoundary';
import SettingsPanel from './components/SettingsPanel';
import StatsPanel from './components/StatsPanel';
import DataManager from './components/DataManager';
import { Friend } from './types';
import { useFriendsFilter } from './hooks/useFriends';
import { useMapNavigation } from './hooks/useMapNavigation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useUserPreferences } from './hooks/useStorage';
import { usePerformanceMonitor, useMemoryMonitor, useNetworkMonitor } from './hooks/usePerformance';
import { DEFAULT_WORLD_VIEWPORT, DEFAULT_CHINA_VIEWPORT } from './utils/mapUtils';
import friendsData from './data/friends.json';
import './App.css';

const App: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const stored = localStorage.getItem('friendsData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* fall through to default */ }
    return friendsData as Friend[];
  });
  const [activeMap, setActiveMap] = useState<'world' | 'china'>('world');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [highlightedFriendId, setHighlightedFriendId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 初始化Hooks
  const { preferences, setPreferences } = useUserPreferences();
  useTheme();
  const isOnline = useNetworkMonitor();
  
  // 性能监控 (仅在开发环境启用，但始终调用Hook)
  usePerformanceMonitor('App');
  useMemoryMonitor();

  const { filteredFriends, regions, allTags, totalCount, filteredCount } = useFriendsFilter(friends, {
    searchQuery,
    selectedRegion,
    selectedTag
  });

  const { mapRef, flyToFriend } = useMapNavigation();

  // 优化地区选项的计算：一次遍历统计各省份数量，O(n)
  const regionOptions = useMemo(() => {
    const provinceCount = friends.reduce((acc, f) => {
      acc.set(f.province, (acc.get(f.province) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    return [
      { value: 'all', label: `🌏 全部地区 (${totalCount})` },
      ...regions.map(region => {
        const count = provinceCount.get(region) || 0;
        return {
          value: region,
          label: `📍 ${region} (${count})`,
          count
        };
      })
    ];
  }, [regions, friends, totalCount]);

  // 优化回调函数，避免不必要的重渲染
  const handleMapToggle = useCallback(() => {
    setActiveMap(prev => {
      const newMapType = prev === 'world' ? 'china' : 'world';
      // 在状态更新时保存偏好设置
      if (preferences.autoSave) {
        setPreferences(prevPrefs => ({
          ...prevPrefs,
          mapType: newMapType
        }));
      }
      return newMapType;
    });
  }, [preferences.autoSave, setPreferences]);

  const handleSearchFocus = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleRegionChange = useCallback((value: string) => {
    setSelectedRegion(value);
  }, []);

  const handleTagChange = useCallback((value: string) => {
    setSelectedTag(value);
  }, []);

  // 标签选项
  const tagOptions = useMemo(() => {
    if (allTags.length === 0) return [];
    const tagCount = friends.reduce((acc, f) => {
      f.tags?.forEach(t => acc.set(t, (acc.get(t) || 0) + 1));
      return acc;
    }, new Map<string, number>());
    return [
      { value: 'all', label: `🏷️ 全部标签` },
      ...allTags.map(tag => ({
        value: tag,
        label: `🏷️ ${tag} (${tagCount.get(tag) || 0})`,
      }))
    ];
  }, [allTags, friends]);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // 移动端滑动手势
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      // 只在水平滑动距离 > 垂直滑动距离时触发
      if (Math.abs(diffX) < 60 || Math.abs(diffX) < Math.abs(diffY)) return;

      // 从左边缘右滑 → 打开侧边栏
      if (diffX > 0 && startX < 30 && sidebarCollapsed) {
        setSidebarCollapsed(false);
      }
      // 左滑 → 关闭侧边栏
      if (diffX < 0 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarCollapsed]);

  const handleImportFriends = useCallback((imported: Friend[]) => {
    setFriends(imported);
    try {
      localStorage.setItem('friendsData', JSON.stringify(imported));
    } catch (e) {
      console.warn('保存导入数据到 localStorage 失败:', e);
    }
  }, []);

  // 键盘快捷键
  const { showHelp, setShowHelp } = useKeyboardShortcuts(
    handleMapToggle,
    handleSearchFocus,
    handleSearchClear,
    handleOpenSettings
  );

  // 应用用户偏好设置（仅在初始化时应用）
  useEffect(() => {
    if (preferences.autoSave && preferences.mapType !== activeMap) {
      setActiveMap(preferences.mapType);
    }
    // 仅在挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 添加错误边界处理
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>🗺️ 朋友分布地图</h1>
          <div className="header-controls">
            <div className="map-controls" role="group" aria-label="地图切换">
              <button
                className={`map-btn ${activeMap === 'world' ? 'active' : ''}`}
                onClick={() => setActiveMap(prev => {
                  if (prev !== 'world') {
                    if (preferences.autoSave) setPreferences(p => ({ ...p, mapType: 'world' as const }));
                    return 'world';
                  }
                  return prev;
                })}
                aria-pressed={activeMap === 'world'}
                aria-label="切换到世界地图"
              >
                🌍 世界地图
              </button>
              <button
                className={`map-btn ${activeMap === 'china' ? 'active' : ''}`}
                onClick={() => setActiveMap(prev => {
                  if (prev !== 'china') {
                    if (preferences.autoSave) setPreferences(p => ({ ...p, mapType: 'china' as const }));
                    return 'china';
                  }
                  return prev;
                })}
                aria-pressed={activeMap === 'china'}
                aria-label="切换到中国地图"
              >
                🇨🇳 中国地图
              </button>
            </div>
            
            <div className="header-actions">
              <button
                className="settings-btn"
                onClick={handleOpenSettings}
                aria-label="打开设置"
                title="设置"
              >
                ⚙️
              </button>
              
              <a 
                href="https://github.com/LeKZzzz/friends-map" 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
                title="查看源代码"
                aria-label="在GitHub上查看源代码"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </header>
        
        <div className="app-main">
          <aside className={`friends-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="朋友列表侧边栏">
            <button
              className="sidebar-toggle-btn"
              onClick={handleToggleSidebar}
              aria-label={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
              title={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
            
            {!sidebarCollapsed && (
              <>
                <div className="sidebar-header">
              <h3>朋友列表 ({filteredCount}/{totalCount})</h3>
              
              {/* 在线状态指示器 */}
              <div className={`online-indicator ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? '🟢 在线' : '🔴 离线'}
              </div>
              
              {/* 搜索框 */}
              <div className="search-container">
                <label className="filter-label" htmlFor="friend-search">搜索朋友</label>
                <div className="search-input-wrapper">
                  <input
                    id="friend-search"
                    ref={searchInputRef}
                    type="text"
                    placeholder="🔍 输入姓名、城市或地址..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleSearchClear}
                      className="search-clear-btn"
                      title="清空搜索"
                      aria-label="清空搜索内容"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {/* 地区筛选 */}
              <div className="filter-container">
                <label className="filter-label" htmlFor="region-filter">按地区筛选</label>
                <CustomSelect
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  options={regionOptions}
                  placeholder="选择地区"
                  aria-label="按地区筛选朋友"
                />
              </div>

              {/* 标签筛选 */}
              {allTags.length > 0 && (
                <div className="filter-container">
                  <label className="filter-label" htmlFor="tag-filter">按标签筛选</label>
                  <CustomSelect
                    value={selectedTag}
                    onChange={handleTagChange}
                    options={tagOptions}
                    placeholder="选择标签"
                    aria-label="按标签筛选朋友"
                  />
                </div>
              )}
            </div>
            
            <div className="friends-list-container">
              <div className="friends-list" role="list" aria-label="朋友列表">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <FriendItem
                      key={friend.id}
                      friend={friend}
                      onClick={(f) => {
                        flyToFriend(f);
                        setHighlightedFriendId(f.id);
                        setTimeout(() => setHighlightedFriendId(null), 1500);
                      }}
                    />
                  ))
                ) : (
                  <div className="no-results" role="status" aria-live="polite">
                    <p>😔 没有找到匹配的朋友</p>
                    <small>尝试调整搜索条件</small>
                  </div>
                )}
              </div>
            </div>

            <DataManager friends={friends} onImport={handleImportFriends} />

            <StatsPanel friends={friends} />
              </>
            )}
          </aside>
          
          <main className="map-area" role="main" aria-label="地图显示区域">
            <MapView
              ref={mapRef}
              friends={filteredFriends}
              allFriends={friends}
              viewport={activeMap === 'world' ? DEFAULT_WORLD_VIEWPORT : DEFAULT_CHINA_VIEWPORT}
              mapType={activeMap}
              highlightedFriendId={highlightedFriendId}
            />
          </main>
        </div>

        {/* 设置面板 */}
        <SettingsPanel
          isOpen={settingsOpen}
          onClose={handleCloseSettings}
        />

        {/* 快捷键帮助面板 */}
        {showHelp && (
          <div className="help-overlay" onClick={() => setShowHelp(false)}>
            <div className="help-panel" onClick={(e) => e.stopPropagation()}>
              <div className="help-header">
                <h3>⌨️ 键盘快捷键</h3>
                <button className="settings-close-btn" onClick={() => setShowHelp(false)} aria-label="关闭帮助">✕</button>
              </div>
              <div className="help-content">
                <div className="help-item"><kbd>M</kbd> <span>切换地图类型</span></div>
                <div className="help-item"><kbd>F</kbd> <span>聚焦搜索框</span></div>
                <div className="help-item"><kbd>Esc</kbd> <span>清空搜索 / 关闭面板</span></div>
                <div className="help-item"><kbd>,</kbd> <span>打开设置</span></div>
                <div className="help-item"><kbd>?</kbd> <span>显示快捷键帮助</span></div>
                <div className="help-item"><kbd>Tab</kbd> <span>在侧边栏中导航</span></div>
                <div className="help-item"><kbd>Enter</kbd> <span>激活好友定位</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;