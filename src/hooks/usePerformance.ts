import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} 渲染时间: ${renderTime.toFixed(2)}ms (第${renderCount.current}次渲染)`);
      
      // 如果渲染时间超过阈值，发出警告
      if (renderTime > 16) { // 16ms 对应 60fps
        console.warn(`${componentName} 渲染时间较长: ${renderTime.toFixed(2)}ms`);
      }
    }

    return () => {
      // 清理工作
    };
  });

  return {
    renderCount: renderCount.current,
    logPerformance: (operation: string, startTime: number) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} - ${operation}: ${duration.toFixed(2)}ms`);
      }
    }
  };
};

// 内存使用监控
export const useMemoryMonitor = () => {
  useEffect(() => {
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
  useEffect(() => {
    const handleOnline = () => console.log('网络连接已恢复');
    const handleOffline = () => console.warn('网络连接已断开');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return navigator.onLine;
};