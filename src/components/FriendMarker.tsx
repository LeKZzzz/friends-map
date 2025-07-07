import React from 'react';
import { Friend } from '../types';

interface FriendMarkerProps {
  friend: Friend;
  onClick: (friend: Friend) => void;
}

const FriendMarker: React.FC<FriendMarkerProps> = ({ friend, onClick }) => {
  return (
    <div 
      className="friend-marker"
      onClick={() => onClick(friend)}
      title={`${friend.name} - ${friend.city}`}
    >
      <div className="marker-pin">
        <img 
          src={friend.avatar || 'https://via.placeholder.com/30'} 
          alt={friend.name}
          className="marker-avatar"
        />
      </div>
      <div className="marker-label">
        {friend.name}
      </div>
    </div>
  );
};

export default FriendMarker;