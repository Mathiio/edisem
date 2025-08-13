import React, { useState, useEffect } from 'react';
import { MaximizeIcon, MinimizeIcon, SquareIcon, GalleryIcon } from '@/components/ui/icons';

interface MediaViewerProps {
  src: string;
  alt?: string;
  className?: string;
  isVideo?: boolean;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ src, alt = 'Media', className = '', isVideo = false }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover');
  const [showControls, setShowControls] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleObjectFit = () => {
    setObjectFit(objectFit === 'cover' ? 'contain' : 'cover');
  };

  // Gestion de la touche Échap pour sortir du plein écran
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-[16px] flex items-center justify-center p-4 animate-in fade-in duration-300'
    : `relative ${className}`;

  const mediaWrapperClasses = isFullscreen ? ' flex justify-center max-w-[60vh] items-center max-h-[60vh]' : 'relative w-full h-full';

  const mediaClasses = `transition-all duration-500 ease-out transform ${
    isFullscreen
      ? `rounded-12 shadow-2xl ${objectFit === 'cover' ? 'object-cover w-full h-full' : 'object-contain'} animate-in zoom-in-95 duration-300`
      : `w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`
  }`;

  // Style pour l'effet d'ombre sur les icônes
  const iconShadowStyle = {
    filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.8))',
    WebkitFilter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.8))',
  };

  return (
    <div className={containerClasses} onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      {/* Wrapper pour le média et les contrôles associés */}
      <div className={mediaWrapperClasses}>
        {/* Média principal */}
        {isVideo ? <video src={src} controls className={mediaClasses} /> : <img src={src} alt={alt} className={mediaClasses} />}

        {/* Contrôles en bas à droite de l'IMAGE */}
        <div
          className={`absolute bottom-4 right-4 flex items-center gap-10 bg-[#000] bg-opacity-30 backdrop-blur-[16px] rounded-12 px-3 py-2 transition-all duration-300 ease-out z-10 transform ${
            showControls ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
          }`}>
          <div className='flex gap-1'>
            {/* Bouton mode d'affichage */}
            {!isFullscreen && (
              <button
                onClick={toggleObjectFit}
                className='text-[#fff] p-2 rounded-12 hover:bg-[#fff] hover:bg-opacity-20 transition-all duration-200'
                title={objectFit === 'cover' ? 'Mode Contain (ajuster)' : 'Mode Cover (remplir)'}>
                <div style={iconShadowStyle}>{objectFit === 'cover' ? <MinimizeIcon size={20} /> : <SquareIcon size={20} />}</div>
              </button>
            )}

            {/* Bouton plein écran */}
            <button
              onClick={toggleFullscreen}
              className='text-[#fff] p-2 rounded-12 hover:bg-[#fff] hover:bg-opacity-20 transition-all duration-200'
              title={isFullscreen ? 'Quitter le plein écran (Échap)' : 'Plein écran'}>
              <div style={iconShadowStyle}>{isFullscreen ? <GalleryIcon size={20} /> : <MaximizeIcon size={20} />}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
