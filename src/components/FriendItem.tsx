import React, { memo } from 'react';
import { Friend } from '../types';

interface FriendItemProps {
  friend: Friend;
  onClick: (friend: Friend) => void;
}

const FriendItem: React.FC<FriendItemProps> = memo(({ friend, onClick }) => {
  return (
    <div 
      className="friend-item"
      onClick={() => onClick(friend)}
    >
      <img 
        src={friend.avatar || `https://www.gravatar.com/avatar/${friend.id}?s=40&d=monsterid&r=pg`} 
        alt={friend.name}
        className="friend-item-avatar"
        loading="lazy"
      />
      <div className="friend-item-info">
        <h4>{friend.name}</h4>
        <p>{friend.province} {friend.city}</p>
        {friend.address && <small>{friend.address}</small>}
      </div>
      <div className="friend-item-action">
        🎯
      </div>
    </div>
  );
});

FriendItem.displayName = 'FriendItem';

export default FriendItem;