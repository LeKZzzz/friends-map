import React, { useState, useRef, useImperativeHandle, forwardRef, useCallback, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Friend, MapRef } from '../types';
import { escapeHtml } from '../utils/mapUtils';
import { MapViewport } from '../types';
import FriendInfo from './FriendInfo';
import 'leaflet/dist/leaflet.css';

// 修复默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  friends: Friend[];
  allFriends?: Friend[];
  viewport: MapViewport;
  mapType: 'world' | 'china';
  highlightedFriendId?: string | null;
}

const MapView = forwardRef<MapRef, MapViewProps>(({ friends, allFriends, viewport, mapType, highlightedFriendId }, ref) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const iconCache = useRef<Map<string, L.DivIcon>>(new Map());

  // 用 Set 快速判断哪些 friend 在筛选结果中
  const filteredIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    filteredIds.current = new Set(friends.map(f => f.id));
  }, [friends]);

  // 显示全部好友（用于 marker），但未在筛选结果中的降低透明度
  const displayFriends = allFriends || friends;
  const hasFilter = displayFriends.length !== friends.length;

  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number, zoom = 10) => {
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], zoom, {
          duration: 1.5
        });
      }
    }
  }));

  // mapType 变更时清理图标缓存
  useEffect(() => {
    iconCache.current.clear();
  }, [mapType]);

  const createCustomIcon = useCallback((friend: Friend, dimmed: boolean) => {
    const cacheKey = `${friend.id}:${mapType}${dimmed ? ':dim' : ''}`;
    const cached = iconCache.current.get(cacheKey);
    if (cached) return cached;

    const avatarUrl = friend.avatar || `https://www.gravatar.com/avatar/${encodeURIComponent(friend.id)}?s=30&d=monsterid&r=pg`;
    const opacity = dimmed ? '0.3' : '1';
    const icon = L.divIcon({
      html: `
        <div data-friend-id="${escapeHtml(friend.id)}" role="button" aria-label="查看 ${escapeHtml(friend.name)} 的位置" style="
          width: 40px;
          height: 40px;
          background-color: ${mapType === 'world' ? '#ff6b6b' : '#e74c3c'};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          opacity: ${opacity};
          transition: opacity 0.3s ease;
        ">
          <img
            src="${escapeHtml(avatarUrl)}"
            alt="${escapeHtml(friend.name)}"
            style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;"
          />
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
    iconCache.current.set(cacheKey, icon);
    return icon;
  }, [mapType]);

  // 聚类图标创建
  const clusterIcon = useCallback((cluster: any) => {
    const count = cluster.getChildCount();
    let size = 'small';
    let dimension = 40;
    if (count > 100) { size = 'large'; dimension = 60; }
    else if (count > 10) { size = 'medium'; dimension = 50; }

    return L.divIcon({
      html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(dimension, dimension),
    });
  }, []);

  // 聚类配置
  const clusterOptions = useMemo(() => ({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    iconCreateFunction: clusterIcon,
  }), [clusterIcon]);

  // 高亮动画：当 highlightedFriendId 变化时，为对应 marker 添加动画类
  useEffect(() => {
    if (!highlightedFriendId) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-friend-id="${highlightedFriendId}"]`);
      if (el) {
        el.classList.add('marker-highlight');
        setTimeout(() => el.classList.remove('marker-highlight'), 1500);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [highlightedFriendId]);

  const containerClassName = mapType === 'world' ? 'world-map-container' : 'china-map-container';
  const mapClassName = mapType === 'world' ? 'world-map' : 'china-map';

  return (
    <div className={containerClassName}>
      <MapContainer
        center={viewport.center}
        zoom={viewport.zoom}
        className={mapClassName}
        aria-label="好友分布地图"
        worldCopyJump={mapType === 'world'}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerClusterGroup key={mapType} {...clusterOptions}>
          {displayFriends.map((friend) => {
            const dimmed = hasFilter && !filteredIds.current.has(friend.id);
            return (
              <Marker
                key={friend.id}
                position={[friend.latitude, friend.longitude]}
                icon={createCustomIcon(friend, dimmed)}
                opacity={dimmed ? 0.4 : 1}
                eventHandlers={{
                  click: () => !dimmed && setSelectedFriend(friend),
                }}
              >
                <Tooltip permanent={false} direction="top" offset={[0, -40]}>
                  <div style={{ textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{escapeHtml(friend.name)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #666)' }}>{escapeHtml(friend.city)}</div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {selectedFriend && (
        <FriendInfo
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </div>
  );
});

MapView.displayName = 'MapView';

export default MapView;
