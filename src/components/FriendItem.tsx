import React, { memo } from 'react';
import { Friend } from '../types';

interface FriendItemProps {
  friend: Friend;
  onClick: (friend: Friend) => void;
}

const FriendItem: React.FC<FriendItemProps> = memo(({ friend, onClick }) => {
  const handleClick = () => onClick(friend);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(friend);
    }
  };

  return (
    <div
      className="friend-item"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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
      <div className="friend-item-action" aria-hidden="true">
        🎯
      </div>
    </div>
  );
});

FriendItem.displayName = 'FriendItem';

export default FriendItem;
