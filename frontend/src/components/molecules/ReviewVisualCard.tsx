import React, { useState } from 'react';
import { Badge } from '../atoms/Badge';

export interface ReviewVisualCardProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  badgeLabel?: string;
  userName?: string;
  userAvatar?: string;
  className?: string;
}

export const ReviewVisualCard: React.FC<ReviewVisualCardProps> = ({
  mediaUrl,
  mediaType,
  badgeLabel,
  userName,
  userAvatar,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    if (mediaType === 'video') {
      setIsModalOpen(true);
    }
    // Optional: Add image modal pop-out if needed in the future
  };

  const closeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={`relative group overflow-hidden rounded-3xl aspect-square cursor-pointer ${className}`}
        onClick={handleCardClick}
      >
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={mediaUrl}
            alt={userName ? `${userName}'s review` : 'Review visual'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}
        
        {/* Top Right Badge */}
        {badgeLabel && (
          <div className="absolute top-6 right-6 z-10">
            <Badge variant="overlay">{badgeLabel}</Badge>
          </div>
        )}

        {/* User Info Overlay (Bottom) */}
        {userName && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
            {userAvatar && (
              <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full border border-white" />
            )}
            <span className="text-white text-sm font-medium drop-shadow-md">{userName}</span>
          </div>
        )}
      </div>

      {/* Video Modal Popup */}
      {isModalOpen && mediaType === 'video' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-opacity duration-300"
          onClick={closeModal}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden bg-black flex flex-col justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex justify-center items-center text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* User Info overlay in Modal */}
            {userName && (
              <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
                {userAvatar && (
                  <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-full border-2 border-white shadow-lg" />
                )}
                <span className="text-white font-semibold text-lg drop-shadow-md">{userName}</span>
              </div>
            )}

            <video
              src={mediaUrl}
              className="w-full max-h-[85vh] object-contain"
              autoPlay
              controls
              playsInline
            />
          </div>
        </div>
      )}
    </>
  );
};
