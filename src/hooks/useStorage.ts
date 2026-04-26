import { useState, useEffect, useCallback, useRef } from 'react';
import { MapViewport } from '../types';

type StorageType = 'localStorage' | 'sessionStorage';
const STORAGE_SYNC_EVENT = 'app:storage-sync';
type MapType = 'world' | 'china';
type ViewportsByMapType = Partial<Record<MapType, MapViewport>>;

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  mapType: MapType;
  autoSave: boolean;
  viewports?: ViewportsByMapType;
}

interface StorageSyncDetail {
  key: string;
  storageType: StorageType;
  newValue: string | null;
}

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

  // 用 ref 追踪最新值，避免闭包陷阱
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(storedValueRef.current) : value;
      setStoredValue(newValue);
      storedValueRef.current = newValue;

      if (storage) {
        const serialized = serializer.stringify(newValue);
        storage.setItem(key, serialized);
        window.dispatchEvent(new CustomEvent<StorageSyncDetail>(STORAGE_SYNC_EVENT, {
          detail: {
            key,
            storageType,
            newValue: serialized,
          }
        }));
      }
    } catch (error) {
      console.warn(`Error setting ${storageType} key "${key}":`, error);
    }
  }, [key, storage, serializer, storageType]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      storedValueRef.current = defaultValue;
      if (storage) {
        storage.removeItem(key);
        window.dispatchEvent(new CustomEvent<StorageSyncDetail>(STORAGE_SYNC_EVENT, {
          detail: {
            key,
            storageType,
            newValue: null,
          }
        }));
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
          const newValue = serializer.parse(e.newValue);
          setStoredValue(newValue);
          storedValueRef.current = newValue;
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    const handleSameTabStorageChange = (e: Event) => {
      const event = e as CustomEvent<StorageSyncDetail>;
      const detail = event.detail;
      if (!detail || detail.key !== key || detail.storageType !== storageType) return;

      if (detail.newValue === null) {
        setStoredValue(defaultValue);
        storedValueRef.current = defaultValue;
        return;
      }

      try {
        const newValue = serializer.parse(detail.newValue);
        setStoredValue(newValue);
        storedValueRef.current = newValue;
      } catch (error) {
        console.warn(`Error parsing same-tab storage event for key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(STORAGE_SYNC_EVENT, handleSameTabStorageChange as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(STORAGE_SYNC_EVENT, handleSameTabStorageChange as EventListener);
    };
  }, [defaultValue, key, serializer, storage, storageType]);

  return [storedValue, setValue, removeValue] as const;
}

// 专门用于用户偏好设置的Hook
export function useUserPreferences() {
  const [preferences, setPreferences] = useStorage<UserPreferences>('userPreferences', {
    theme: 'light' as 'light' | 'dark' | 'system',
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
