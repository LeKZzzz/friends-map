import React, { useEffect, useState, useCallback } from 'react';
import { Friend } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface FriendInfoProps {
  friend: Friend;
  onClose: () => void;
}

const FriendInfo: React.FC<FriendInfoProps> = ({ friend, onClose }) => {
  const avatarUrl = friend.avatar || `https://www.gravatar.com/avatar/${friend.id}?s=60&d=monsterid&r=pg`;
  const { containerRef, handleKeyDown } = useFocusTrap(true);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const shareText = `我的朋友 ${friend.name} 在 ${friend.province}${friend.city}！经纬度：${friend.latitude.toFixed(4)}, ${friend.longitude.toFixed(4)}`;

  const handleShare = useCallback(async () => {
    // 优先使用 Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `朋友：${friend.name}`,
          text: shareText,
        });
        return;
      } catch (err) {
        // 用户取消分享，不处理
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // 降级到剪贴板复制
    try {
      await navigator.clipboard.writeText(shareText);
      setShareStatus('已复制到剪贴板');
      setTimeout(() => setShareStatus(null), 2000);
    } catch {
      setShareStatus('复制失败，请手动复制');
      setTimeout(() => setShareStatus(null), 2000);
    }
  }, [friend.name, shareText]);

  return (
    <div
      className="friend-info-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="好友详情"
    >
      <div
        className="friend-info-card"
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
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
          <button className="close-btn" onClick={onClose} aria-label="关闭">x</button>
        </div>
        {friend.description && (
          <div className="friend-description">
            <p>{friend.description}</p>
          </div>
        )}
        <div className="friend-coordinates">
          <small>坐标: {friend.latitude.toFixed(4)}, {friend.longitude.toFixed(4)}</small>
        </div>
        <div className="friend-share">
          <button className="share-btn" onClick={handleShare} aria-label="分享好友位置">
            📤 分享
          </button>
          {shareStatus && <span className="share-status">{shareStatus}</span>}
        </div>
      </div>
    </div>
  );
};

export default FriendInfo;
