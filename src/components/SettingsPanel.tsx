import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useUserPreferences } from '../hooks/useStorage';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { preferences, updatePreference } = useUserPreferences();
  const { containerRef, handleKeyDown } = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="settings-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="设置"
    >
      <div
        className="settings-panel"
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
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
              {([
                { value: 'light' as const, label: '☀️ 亮色' },
                { value: 'dark' as const, label: '🌙 暗色' },
                { value: 'system' as const, label: '💻 跟随系统' },
              ]).map(({ value: themeValue, label }) => (
                <button
                  key={themeValue}
                  className={`theme-btn ${theme === themeValue ? 'active' : ''}`}
                  onClick={() => setTheme(themeValue)}
                  aria-pressed={theme === themeValue}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="setting-description">
              当前主题: {effectiveTheme === 'light' ? '亮色' : '暗色'}
              {theme === 'system' && '（跟随系统）'}
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
                <span className="stat-value">{effectiveTheme === 'light' ? '亮色' : '暗色'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button
            className="reset-btn"
            onClick={() => {
              if (window.confirm('确定要重置所有设置吗？')) {
                localStorage.removeItem('userPreferences');
                localStorage.removeItem('theme');
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
