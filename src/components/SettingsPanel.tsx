import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useUserPreferences } from '../hooks/useStorage';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { preferences, updatePreference } = useUserPreferences();

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>⚙️ 设置</h3>
          <button 
            className="settings-close-btn"
            onClick={onClose}
            aria-label="关闭设置"
          >
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* 主题设置 */}
          <div className="setting-group">
            <label className="setting-label">🎨 主题设置</label>
            <div className="theme-options">
              {(['light', 'dark'] as const).map((themeName) => (
                <button
                  key={themeName}
                  className={`theme-btn ${theme === themeName ? 'active' : ''}`}
                  onClick={() => setTheme(themeName)}
                  aria-pressed={theme === themeName}
                >
                  {themeName === 'light' && '☀️ 亮色'}
                  {themeName === 'dark' && '🌙 暗色'}
                </button>
              ))}
            </div>
            <p className="setting-description">
              当前主题: {effectiveTheme === 'light' ? '亮色' : '暗色'}
            </p>
          </div>

          {/* 视图设置 */}
          <div className="setting-group">
            <label className="setting-label">视图设置</label>
            <div className="setting-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.autoSave}
                  onChange={(e) => updatePreference('autoSave', e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                自动保存视图状态
              </label>
            </div>
            <p className="setting-description">
              开启后会自动保存地图类型、搜索条件等设置
            </p>
          </div>

          {/* 数据统计 */}
          <div className="setting-group">
            <label className="setting-label">📊 数据统计</label>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">存储空间</span>
                <span className="stat-value">
                  {Math.round(JSON.stringify(preferences).length / 1024 * 100) / 100} KB
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">当前主题</span>
                <span className="stat-value">{effectiveTheme}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button 
            className="reset-btn"
            onClick={() => {
              if (window.confirm('确定要重置所有设置吗？')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            🔄 重置设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;