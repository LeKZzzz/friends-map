import React, { useMemo, useState } from 'react';
import { Friend } from '../types';

interface StatsPanelProps {
  friends: Friend[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ friends }) => {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => {
    const provinces = new Set(friends.map(f => f.province));
    const cities = new Set(friends.map(f => f.city));

    const provinceCount = friends.reduce((acc, f) => {
      acc.set(f.province, (acc.get(f.province) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    const cityCount = friends.reduce((acc, f) => {
      acc.set(f.city, (acc.get(f.city) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    const provinceRank = Array.from(provinceCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const cityRank = Array.from(cityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalFriends: friends.length,
      totalProvinces: provinces.size,
      totalCities: cities.size,
      provinceRank,
      cityRank,
    };
  }, [friends]);

  return (
    <div className="stats-panel-inline">
      <button
        className="stats-toggle-btn"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
      >
        📊 统计 {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <div className="stats-content-inline">
          <div className="stats-summary">
            <div className="stats-summary-item">
              <span className="stats-number">{stats.totalFriends}</span>
              <span className="stats-label">好友</span>
            </div>
            <div className="stats-summary-item">
              <span className="stats-number">{stats.totalProvinces}</span>
              <span className="stats-label">省份</span>
            </div>
            <div className="stats-summary-item">
              <span className="stats-number">{stats.totalCities}</span>
              <span className="stats-label">城市</span>
            </div>
          </div>

          <div className="stats-ranking">
            <h4>省份排行</h4>
            {stats.provinceRank.map(([name, count], i) => (
              <div key={name} className="stats-rank-item">
                <span className="stats-rank-num">{i + 1}</span>
                <span className="stats-rank-name">{name}</span>
                <span className="stats-rank-bar" style={{ width: `${(count / stats.provinceRank[0][1]) * 100}%` }} />
                <span className="stats-rank-count">{count}</span>
              </div>
            ))}
          </div>

          <div className="stats-ranking">
            <h4>城市排行</h4>
            {stats.cityRank.map(([name, count], i) => (
              <div key={name} className="stats-rank-item">
                <span className="stats-rank-num">{i + 1}</span>
                <span className="stats-rank-name">{name}</span>
                <span className="stats-rank-bar" style={{ width: `${(count / stats.cityRank[0][1]) * 100}%` }} />
                <span className="stats-rank-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
