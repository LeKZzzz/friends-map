import React from 'react';
import { Friend } from '../types';

interface FriendInfoProps {
  friend: Friend;
  onClose: () => void;
}

const FriendInfo: React.FC<FriendInfoProps> = ({ friend, onClose }) => {
  const avatarUrl = friend.avatar || `https://www.gravatar.com/avatar/${friend.id}?s=60&d=monsterid&r=pg`;
  
  return (
    <div className="friend-info-overlay" onClick={onClose}>
      <div className="friend-info-card" onClick={(e) => e.stopPropagation()}>
        <div className="friend-info-header">
          <img 
            src={avatarUrl} 
            alt={friend.name}
            className="friend-avatar"
          />
          <div className="friend-basic-info">
            <h3>{friend.name}</h3>
            <p className="friend-location">
              {friend.province} {friend.city}
              {friend.address && <span>, {friend.address}</span>}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {friend.description && (
          <div className="friend-description">
            <p>{friend.description}</p>
          </div>
        )}
        <div className="friend-coordinates">
          <small>坐标: {friend.latitude.toFixed(4)}, {friend.longitude.toFixed(4)}</small>
        </div>
      </div>
    </div>
  );
};

export default FriendInfo;