import { useEffect } from 'react';

export const useKeyboardShortcuts = (
  onToggleMap: () => void,
  onFocusSearch: () => void,
  onClearSearch: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + M 切换地图
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        onToggleMap();
      }
      
      // Ctrl/Cmd + F 聚焦搜索框
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        onFocusSearch();
      }
      
      // ESC 清空搜索
      if (event.key === 'Escape') {
        onClearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggleMap, onFocusSearch, onClearSearch]);
};