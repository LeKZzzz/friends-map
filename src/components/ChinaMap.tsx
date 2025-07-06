import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Friend } from '../types';
import { getChinaFriends, DEFAULT_CHINA_VIEWPORT } from '../utils/mapUtils';
import FriendInfo from './FriendInfo';
import 'leaflet/dist/leaflet.css';

// 修复默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ChinaMapProps {
  friends: Friend[];
}

const ChinaMap: React.FC<ChinaMapProps> = ({ friends }) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const chinaFriends = getChinaFriends(friends);

  // 创建自定义图标
  const createCustomIcon = (friend: Friend) => {
    const avatarUrl = friend.avatar || `https://www.gravatar.com/avatar/${friend.id}?s=30&d=monsterid&r=pg`;
    return L.divIcon({
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background-color: #e74c3c;
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

  return (
    <div className="china-map-container">
      <MapContainer
        center={DEFAULT_CHINA_VIEWPORT.center}
        zoom={DEFAULT_CHINA_VIEWPORT.zoom}
        className="china-map"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {chinaFriends.map((friend) => (
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
};

export default ChinaMap;