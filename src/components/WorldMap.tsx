import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Friend, MapRef } from '../types';
import { getWorldFriends, DEFAULT_WORLD_VIEWPORT } from '../utils/mapUtils';
import FriendInfo from './FriendInfo';
import 'leaflet/dist/leaflet.css';

// 修复默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WorldMapProps {
  friends: Friend[];
}

const WorldMap = forwardRef<MapRef, WorldMapProps>(({ friends }, ref) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const worldFriends = getWorldFriends(friends);

  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number, zoom = 10) => {
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], zoom, {
          duration: 1.5
        });
      }
    }
  }));

  // 创建自定义图标
  const createCustomIcon = (friend: Friend) => {
    const avatarUrl = friend.avatar || `https://www.gravatar.com/avatar/${friend.id}?s=30&d=monsterid&r=pg`;
    return L.divIcon({
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background-color: #ff6b6b;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          <img 
            src="${avatarUrl}" 
            alt="${friend.name}"
            style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;"
          />
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  // 渲染朋友标记
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !friends.length) return;

    // 清除现有标记
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // 显示所有朋友标记
    friends.forEach(friend => {
      if (friend.latitude && friend.longitude) {
        const marker = L.marker([friend.latitude, friend.longitude])
          .addTo(map)
          .bindPopup(`
            <div class="popup-content">
              <h3>${friend.name}</h3>
              <p>${friend.city}, ${friend.province}</p>
              <small>坐标: ${friend.latitude}, ${friend.longitude}</small>
            </div>
          `);

        markersRef.current.push(marker);
      }
    });
  }, [friends]);

  return (
    <div className="world-map-container">
      <MapContainer
        center={DEFAULT_WORLD_VIEWPORT.center}
        zoom={DEFAULT_WORLD_VIEWPORT.zoom}
        className="world-map"
        worldCopyJump={true}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {worldFriends.map((friend) => (
          <Marker
            key={friend.id}
            position={[friend.latitude, friend.longitude]}
            icon={createCustomIcon(friend)}
            eventHandlers={{
              click: () => setSelectedFriend(friend),
            }}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -40]}>
              <div style={{ textAlign: 'center', minWidth: '120px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{friend.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{friend.city}</div>
              </div>
            </Tooltip>
          </Marker>
        ))}
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

WorldMap.displayName = 'WorldMap';

export default WorldMap;