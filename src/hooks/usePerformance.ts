import { useEffect, useRef, useState } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;

    if (process.env.NODE_ENV === 'development') {
      if (renderCount.current > 1) {
        console.log(`${componentName} 第${renderCount.current}次渲染`);
      }

      if (renderCount.current > 10) {
        console.warn(`${componentName} 渲染次数过多: ${renderCount.current}次`);
      }
    }
  });

  return {
    renderCount: renderCount.current,
  };
};

// 内存使用监控
export const useMemoryMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('内存使用情况:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        });
      }
    };

    // 每30秒检查一次内存使用
    const interval = setInterval(checkMemory, 30000);

    return () => clearInterval(interval);
  }, []);
};

// 网络状态监控
export const useNetworkMonitor = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('网络连接已恢复');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.warn('网络连接已断开');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
