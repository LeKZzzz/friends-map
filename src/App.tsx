import React, { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import ChinaMap from './components/ChinaMap';
import { Friend } from './types';
import friendsData from './data/friends.json';
import './App.css';

const App: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeMap, setActiveMap] = useState<'world' | 'china'>('world');

  useEffect(() => {
    setFriends(friendsData);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>朋友分布地图</h1>
        <div className="map-controls">
          <button 
            className={`map-btn ${activeMap === 'world' ? 'active' : ''}`}
            onClick={() => setActiveMap('world')}
          >
            世界地图
          </button>
          <button 
            className={`map-btn ${activeMap === 'china' ? 'active' : ''}`}
            onClick={() => setActiveMap('china')}
          >
            中国地图
          </button>
        </div>
      </header>
      
      <div className="app-main">
        <aside className="friends-sidebar">
          <h3>朋友列表 ({friends.length})</h3>
          <div className="friends-list">
            {friends.map((friend) => (
              <div key={friend.id} className="friend-item">
                <img 
                  src={friend.avatar || `https://www.gravatar.com/avatar/${friend.id}?s=40&d=monsterid&r=pg`} 
                  alt={friend.name}
                  className="friend-item-avatar"
                />
                <div className="friend-item-info">
                  <h4>{friend.name}</h4>
                  <p>{friend.province} {friend.city}</p>
                  {friend.address && <small>{friend.address}</small>}
                </div>
              </div>
            ))}
          </div>
        </aside>
        
        <main className="map-area">
          {activeMap === 'world' ? (
            <WorldMap friends={friends} />
          ) : (
            <ChinaMap friends={friends} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;