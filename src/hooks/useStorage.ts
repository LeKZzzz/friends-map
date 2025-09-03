import { useState, useEffect, useCallback } from 'react';

type StorageType = 'localStorage' | 'sessionStorage';

interface UseStorageOptions {
  serializer?: {
    parse: (value: string) => any;
    stringify: (value: any) => string;
  };
  storageType?: StorageType;
}

const defaultSerializer = {
  parse: JSON.parse,
  stringify: JSON.stringify,
};

export function useStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions = {}
) {
  const {
    serializer = defaultSerializer,
    storageType = 'localStorage'
  } = options;

  const storage = typeof window !== 'undefined' ? window[storageType] : null;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storage) return defaultValue;
    
    try {
      const item = storage.getItem(key);
      if (item === null) return defaultValue;
      return serializer.parse(item);
    } catch (error) {
      console.warn(`Error reading ${storageType} key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);
      
      if (storage) {
        storage.setItem(key, serializer.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error setting ${storageType} key "${key}":`, error);
    }
  }, [key, storedValue, storage, serializer, storageType]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (storage) {
        storage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing ${storageType} key "${key}":`, error);
    }
  }, [key, defaultValue, storage, storageType]);

  // 监听存储变化
  useEffect(() => {
    if (!storage) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(serializer.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, serializer, storage]);

  return [storedValue, setValue, removeValue] as const;
}

// 专门用于用户偏好设置的Hook
export function useUserPreferences() {
  const [preferences, setPreferences] = useStorage('userPreferences', {
    theme: 'light' as 'light' | 'dark',
    language: 'zh-CN',
    mapType: 'world' as 'world' | 'china',
    autoSave: true,
  });

  return {
    preferences,
    setPreferences,
    updatePreference: <K extends keyof typeof preferences>(key: K, value: typeof preferences[K]) => {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };
}