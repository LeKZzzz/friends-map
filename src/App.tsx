import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import WorldMap from './components/WorldMap';
import ChinaMap from './components/ChinaMap';
import FriendItem from './components/FriendItem';
import CustomSelect from './components/CustomSelect';
import ErrorBoundary from './components/ErrorBoundary';
import SettingsPanel from './components/SettingsPanel';
import { Friend } from './types';
import { useFriendsFilter } from './hooks/useFriends';
import { useMapNavigation } from './hooks/useMapNavigation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useUserPreferences } from './hooks/useStorage';
import { usePerformanceMonitor, useMemoryMonitor, useNetworkMonitor } from './hooks/usePerformance';
import friendsData from './data/friends.json';
import './App.css';

const App: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeMap, setActiveMap] = useState<'world' | 'china'>('world');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 初始化Hooks
  const { preferences, setPreferences, updatePreference } = useUserPreferences();
  const { effectiveTheme } = useTheme();
  const isOnline = useNetworkMonitor();
  
  // 性能监控 (仅在开发环境启用，但始终调用Hook)
  usePerformanceMonitor('App');
  useMemoryMonitor();

  const { filteredFriends, regions, totalCount, filteredCount } = useFriendsFilter(friends, {
    searchQuery,
    selectedRegion
  });

  const { worldMapRef, chinaMapRef, flyToFriend } = useMapNavigation(activeMap);

  // 优化地区选项的计算，避免重复计算
  const regionOptions = useMemo(() => [
    { value: 'all', label: `🌏 全部地区 (${totalCount})` },
    ...regions.map(region => {
      const count = friends.filter(f => f.province === region).length;
      return {
        value: region,
        label: `📍 ${region} (${count})`,
        count
      };
    })
  ], [regions, friends, totalCount]);

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

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // 键盘快捷键
  useKeyboardShortcuts(
    handleMapToggle, 
    handleSearchFocus, 
    handleSearchClear,
    handleOpenSettings
  );

  // 应用用户偏好设置（仅在初始化时应用）
  const isInitialMount = useRef(true);
  useEffect(() => {
    // 只在应用启动时，根据autoSave设置来决定是否恢复上次的地图类型
    if (isInitialMount.current && preferences.autoSave && preferences.mapType !== activeMap) {
      setActiveMap(preferences.mapType);
    }
    isInitialMount.current = false;
  }, [preferences.autoSave, preferences.mapType, activeMap]);

  // 当用户手动切换地图时保存到偏好设置
  const saveMapTypeToPreferences = useCallback((mapType: 'world' | 'china') => {
    if (preferences.autoSave) {
      setPreferences(prev => ({
        ...prev,
        mapType
      }));
    }
  }, [preferences.autoSave, setPreferences]);

  useEffect(() => {
    try {
      setFriends(friendsData);
      setLoading(false);
    } catch (err) {
      setError('加载朋友数据失败');
      setLoading(false);
      console.error('Failed to load friends data:', err);
    }
  }, []);

  // 添加错误边界处理
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setError('应用程序遇到错误，请刷新页面重试');
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

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner" aria-label="加载中"></div>
          <p>正在加载朋友数据...</p>
          {!isOnline && (
            <p className="offline-notice">⚠️ 网络连接异常，请检查网络设置</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container" role="alert">
          <p>❌ {error}</p>
          <button onClick={handleRetry} aria-label="重新加载应用">
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>🗺️ 朋友分布地图</h1>
          <div className="header-controls">
            <div className="map-controls" role="group" aria-label="地图切换">
              <button 
                className={`map-btn ${activeMap === 'world' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMap('world');
                  saveMapTypeToPreferences('world');
                }}
                aria-pressed={activeMap === 'world'}
                aria-label="切换到世界地图"
              >
                🌍 世界地图
              </button>
              <button 
                className={`map-btn ${activeMap === 'china' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMap('china');
                  saveMapTypeToPreferences('china');
                }}
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
            </div>
            
            <div className="friends-list-container">
              <div className="friends-list" role="list" aria-label="朋友列表">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <FriendItem
                      key={friend.id}
                      friend={friend}
                      onClick={flyToFriend}
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
              </>
            )}
          </aside>
          
          <main className="map-area" role="main" aria-label="地图显示区域">
            {activeMap === 'world' ? (
              <WorldMap ref={worldMapRef} friends={friends} />
            ) : (
              <ChinaMap ref={chinaMapRef} friends={friends} />
            )}
          </main>
        </div>

        {/* 设置面板 */}
        <SettingsPanel 
          isOpen={settingsOpen}
          onClose={handleCloseSettings}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;