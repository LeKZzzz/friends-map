import { useEffect } from 'react';

export const useKeyboardShortcuts = (
  onToggleMap: () => void,
  onFocusSearch: () => void,
  onClearSearch: () => void,
  onOpenSettings?: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 忽略在输入框内的按键
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // 只在输入框内响应Escape键
        if (event.key === 'Escape') {
          onClearSearch();
          (target as HTMLInputElement).blur();
        }
        return;
      }

      // 防止在有修饰键时触发
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'm':
          event.preventDefault();
          onToggleMap();
          break;
        case 'f':
          event.preventDefault();
          onFocusSearch();
          break;
        case 'escape':
          event.preventDefault();
          onClearSearch();
          break;
        case ',':
          if (onOpenSettings) {
            event.preventDefault();
            onOpenSettings();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleMap, onFocusSearch, onClearSearch, onOpenSettings]);
};