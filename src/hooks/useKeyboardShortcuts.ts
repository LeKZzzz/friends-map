import { useEffect, useState } from 'react';

export const useKeyboardShortcuts = (
  onToggleMap: () => void,
  onFocusSearch: () => void,
  onClearSearch: () => void,
  onOpenSettings?: () => void
) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 跳过 IME 组合输入
      if ((event as any).isComposing) return;

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

      // 如果快捷键帮助面板已打开，Escape 关闭它
      if (showHelp) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setShowHelp(false);
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
        case '?':
          event.preventDefault();
          setShowHelp(true);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleMap, onFocusSearch, onClearSearch, onOpenSettings, showHelp]);

  return { showHelp, setShowHelp };
};
