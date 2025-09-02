import React, { useState, useEffect, useRef } from 'react';
import WorldMap from './components/WorldMap';
import ChinaMap from './components/ChinaMap';
import FriendItem from './components/FriendItem';
import CustomSelect from './components/CustomSelect';
import { Friend } from './types';
import { useFriendsFilter, useMapNavigation } from './hooks/useFriends';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import friendsData from './data/friends.json';
import './App.css';

const App: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeMap, setActiveMap] = useState<'world' | 'china'>('world');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { filteredFriends, regions, totalCount, filteredCount } = useFriendsFilter(friends, {
    searchQuery,
    selectedRegion
  });

  const { worldMapRef, chinaMapRef, flyToFriend } = useMapNavigation(activeMap);

  // 键盘快捷键
  useKeyboardShortcuts(
    () => setActiveMap(prev => prev === 'world' ? 'china' : 'world'),
    () => searchInputRef.current?.focus(),
    () => setSearchQuery('')
  );

  useEffect(() => {
    try {
      setFriends(friendsData);
      setLoading(false);
    } catch (err) {
      setError('加载朋友数据失败');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载朋友数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>重新加载</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗺️ 朋友分布地图</h1>
        <div className="header-controls">
          <div className="map-controls">
            <button 
              className={`map-btn ${activeMap === 'world' ? 'active' : ''}`}
              onClick={() => setActiveMap('world')}
            >
              🌍 世界地图
            </button>
            <button 
              className={`map-btn ${activeMap === 'china' ? 'active' : ''}`}
              onClick={() => setActiveMap('china')}
            >
              🇨🇳 中国地图
            </button>
          </div>
          <a 
            href="https://github.com/LeKZzzz/friends-map" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
            title="查看源代码"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </header>
      
      <div className="app-main">
        <aside className="friends-sidebar">
          <div className="sidebar-header">
            <h3>朋友列表 ({filteredCount}/{totalCount})</h3>
            
            {/* 搜索框 */}
            <div className="search-container">
              <label className="filter-label">搜索朋友</label>
              <div className="search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="🔍 输入姓名、城市或地址..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="search-clear-btn"
                    title="清空搜索"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            {/* 地区筛选 */}
            <div className="filter-container">
              <label className="filter-label">按地区筛选</label>
              <CustomSelect
                value={selectedRegion}
                onChange={setSelectedRegion}
                options={[
                  { value: 'all', label: `🌏 全部地区 (${totalCount})` },
                  ...regions.map(region => {
                    const count = friends.filter(f => f.province === region).length;
                    return {
                      value: region,
                      label: `📍 ${region} (${count})`,
                      count
                    };
                  })
                ]}
                placeholder="选择地区"
              />
            </div>
          </div>
          
          <div className="friends-list">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <FriendItem
                  key={friend.id}
                  friend={friend}
                  onClick={flyToFriend}
                />
              ))
            ) : (
              <div className="no-results">
                <p>😔 没有找到匹配的朋友</p>
                <small>尝试调整搜索条件</small>
              </div>
            )}
          </div>
        </aside>
        
        <main className="map-area">
          {activeMap === 'world' ? (
            <WorldMap ref={worldMapRef} friends={friends} />
          ) : (
            <ChinaMap ref={chinaMapRef} friends={friends} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;