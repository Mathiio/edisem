import React, { useState, useRef, useCallback } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, addToast, Input } from '@heroui/react';
import { Button } from '@/theme/components/button';
import { CameraIcon, CrossIcon, UploadIcon, PlusIcon, MovieIcon } from '@/components/ui/icons';
import { isValidYouTubeUrl } from '@/lib/utils';

export interface MediaFile {
  id: string;
  file?: File;
  url?: string;
  preview: string;
  type: 'image' | 'video';
  name: string;
  isExisting?: boolean;
}

export interface MediaDropzoneProps {
  value: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  existingMedias?: string[]; // URLs des médias déjà reliés
  onRemoveExisting?: (index: number) => void; // Callback pour supprimer un média existant
  youtubeUrls?: string[]; // URLs YouTube ajoutées
  onYouTubeUrlsChange?: (urls: string[]) => void; // Callback pour modifier les URLs YouTube
  maxFiles?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
  height?: string;
}

/**
 * Zone de drag & drop pour les médias avec prévisualisation
 * Style similaire au MediaViewer avec carrousel Splide
 */
// Helper pour extraire l'ID YouTube et générer la thumbnail
const getYouTubeThumbnail = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match ? match[1] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
};

const getYouTubeEmbedUrl = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match ? match[1] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  value = [],
  onChange,
  existingMedias = [],
  onRemoveExisting,
  youtubeUrls = [],
  onYouTubeUrlsChange,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*'],
  disabled = false,
  className = '',
  height = '450px',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaToDelete, setMediaToDelete] = useState<MediaFile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [showAddInterface, setShowAddInterface] = useState(false);
  const [editingYoutubeUrl, setEditingYoutubeUrl] = useState<string | null>(null); // URL en cours d'édition
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID
  const generateId = () => `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Determine if file is video
  const isVideo = (file: File | string): boolean => {
    if (typeof file === 'string') {
      return file.includes('.mov') || file.includes('.mp4') || file.includes('.webm');
    }
    return file.type.startsWith('video/');
  };

  // Combine existing medias, new files, and YouTube URLs
  const allMediaItems: (MediaFile & { isYouTube?: boolean; youtubeUrl?: string })[] = [
    // Médias existants (URLs) - détecter YouTube automatiquement
    ...existingMedias.map((url, index) => {
      const isYouTubeMedia = isValidYouTubeUrl(url);
      return {
        id: `existing-${index}`,
        url: isYouTubeMedia ? getYouTubeEmbedUrl(url) : url,
        preview: isYouTubeMedia ? getYouTubeThumbnail(url) : url,
        type: (isVideo(url) || isYouTubeMedia ? 'video' : 'image') as 'video' | 'image',
        name: isYouTubeMedia ? `Vidéo YouTube ${index + 1}` : `Média existant ${index + 1}`,
        isExisting: true,
        isYouTube: isYouTubeMedia,
        youtubeUrl: isYouTubeMedia ? url : undefined,
      };
    }),
    // Nouveaux fichiers uploadés
    ...value.map((file) => ({
      ...file,
      isExisting: false,
      isYouTube: false,
    })),
    // Vidéos YouTube
    ...youtubeUrls.map((ytUrl, index) => ({
      id: `youtube-${index}`,
      url: getYouTubeEmbedUrl(ytUrl),
      preview: getYouTubeThumbnail(ytUrl),
      type: 'video' as 'video' | 'image',
      name: `Vidéo YouTube ${index + 1}`,
      isExisting: false,
      isYouTube: true,
      youtubeUrl: ytUrl,
    })),
  ];

  const currentMedia = allMediaItems[currentIndex];

  // Types de fichiers rejetés par Omeka S
  const rejectedTypes = ['image/webp'];
  const rejectedExtensions = ['.webp'];

  // Handle file selection
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const newMediaFiles: MediaFile[] = [];
      const rejectedFiles: string[] = [];
      const remainingSlots = maxFiles - allMediaItems.length;

      Array.from(files)
        .slice(0, remainingSlots)
        .forEach((file) => {
          // Vérifier si le type ou l'extension est rejeté
          const isRejectedType = rejectedTypes.includes(file.type);
          const isRejectedExtension = rejectedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

          if (isRejectedType || isRejectedExtension) {
            rejectedFiles.push(file.name);
            return;
          }

          const preview = URL.createObjectURL(file);
          newMediaFiles.push({
            id: generateId(),
            file,
            preview,
            type: isVideo(file) ? 'video' : 'image',
            name: file.name,
            isExisting: false,
          });
        });

      // Afficher un message d'erreur pour les fichiers rejetés
      if (rejectedFiles.length > 0) {
        addToast({
          title: 'Format non supporté',
          description: `Les fichiers WebP ne sont pas acceptés : ${rejectedFiles.join(', ')}`,
          classNames: { base: 'bg-warning text-white' },
        });
      }

      if (newMediaFiles.length > 0) {
        onChange([...value, ...newMediaFiles]);
        setShowAddInterface(false); // Fermer l'interface d'ajout après upload
      }
    },
    [value, onChange, maxFiles, disabled, allMediaItems.length],
  );

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle click to upload
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open delete confirmation modal
  const handleRemoveClick = (media: MediaFile) => {
    setMediaToDelete(media);
    setIsDeleteModalOpen(true);
  };

  // Confirm and remove a media file
  const handleConfirmRemove = () => {
    if (!mediaToDelete) return;

    const mediaWithYoutube = mediaToDelete as MediaFile & { isYouTube?: boolean; youtubeUrl?: string };

    if (mediaWithYoutube.isYouTube) {
      // Supprimer une vidéo YouTube
      if (onYouTubeUrlsChange && mediaWithYoutube.youtubeUrl) {
        const newUrls = youtubeUrls.filter((u) => u !== mediaWithYoutube.youtubeUrl);
        onYouTubeUrlsChange(newUrls);
      }
    } else if (mediaToDelete.isExisting) {
      // Supprimer un média existant
      const existingIndex = existingMedias.findIndex((url) => url === mediaToDelete.url);
      if (existingIndex !== -1 && onRemoveExisting) {
        onRemoveExisting(existingIndex);
      }
    } else {
      // Supprimer un nouveau fichier
      const mediaToRemoveFile = value.find((m) => m.id === mediaToDelete.id);
      if (mediaToRemoveFile?.file) {
        URL.revokeObjectURL(mediaToRemoveFile.preview);
      }
      const newValue = value.filter((m) => m.id !== mediaToDelete.id);
      onChange(newValue);
    }

    // Adjust current index if needed
    if (currentIndex >= allMediaItems.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (allMediaItems.length <= 1) {
      setCurrentIndex(0);
    }

    // Close modal and reset
    setIsDeleteModalOpen(false);
    setMediaToDelete(null);
  };

  // Cancel deletion
  const handleCancelRemove = () => {
    setIsDeleteModalOpen(false);
    setMediaToDelete(null);
  };

  return (
    <div className={`flex flex-col gap-15 `}>
      {/* Main display area */}
      <div
        className={`
          relative rounded-12 overflow-hidden
          transition-all duration-200
          ${isDragging ? 'ring-2 ring-action bg-c2' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{ height }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}>
        {allMediaItems.length > 0 && currentMedia && !showAddInterface ? (
          // Show current media
          <div className={`relative w-full h-full flex flex-col ${className}`}>
            {/* Zone de prévisualisation */}
            <div className='relative flex-1 min-h-0'>
              {currentMedia.isYouTube ? (
                // Afficher iframe YouTube
                <iframe
                  src={currentMedia.url}
                  className='w-full h-full rounded-12'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                  title={currentMedia.name}
                />
              ) : currentMedia.type === 'video' ? (
                <video src={currentMedia.url || currentMedia.preview} className='w-full h-full object-cover' controls />
              ) : (
                <img src={currentMedia.url || currentMedia.preview} alt={currentMedia.name} className='w-full h-full object-cover' />
              )}

              {/* Remove button */}
              {!disabled && (
                <Button
                  isIconOnly
                  size='sm'
                  className='absolute top-3 right-3 bg-c1/80 hover:bg-danger text-c6 hover:text-white rounded-full z-10 px-4 py-2 w-fit h-fit flex items-center justify-center !gap-[10px] rounded-12'
                  onPress={() => handleRemoveClick(currentMedia)}>
                  <span>Supprimer</span>
                  <CrossIcon size={14} className='text-14 w-[14px] h-[14px]' />
                </Button>
              )}
            </div>

            {/* Champ d'édition URL YouTube sous la preview */}
            {currentMedia.isYouTube && !disabled && (
              <div className='flex items-center gap-10 mt-10 p-10 bg-c2 rounded-12 border border-c3'>
                <MovieIcon size={16} className='text-c5 flex-shrink-0' />
                <Input
                  type='url'
                  value={editingYoutubeUrl !== null ? editingYoutubeUrl : currentMedia.youtubeUrl || ''}
                  onChange={(e) => setEditingYoutubeUrl(e.target.value)}
                  onBlur={() => {
                    // Sauvegarder la modification
                    if (editingYoutubeUrl !== null && isValidYouTubeUrl(editingYoutubeUrl)) {
                      const ytIndex = youtubeUrls.findIndex((u) => u === currentMedia.youtubeUrl);
                      if (ytIndex !== -1 && onYouTubeUrlsChange) {
                        const newUrls = [...youtubeUrls];
                        newUrls[ytIndex] = editingYoutubeUrl;
                        onYouTubeUrlsChange(newUrls);
                      }
                    }
                    setEditingYoutubeUrl(null);
                  }}
                  placeholder='URL YouTube'
                  classNames={{
                    inputWrapper: 'bg-c1 border border-c3 rounded-8 flex-1 min-h-[36px]',
                    input: 'text-c6 text-14',
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          // Interface d'ajout - divisée en deux (dropzone + YouTube)
          <div className={`flex w-full h-full gap-15`}>
            {/* Zone de drop pour fichiers */}
            <div
              className={`
                flex flex-col items-center justify-center
                ${onYouTubeUrlsChange ? 'flex-1' : 'w-full'} h-full bg-c3
                border-2 border-dashed rounded-12
                ${isDragging ? 'border-action' : 'border-c4'}
                cursor-pointer
              `}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleClick}>
              <CameraIcon size={40} className='text-c4 mb-4' />
              <p className='text-c5 text-14 font-medium mb-2 text-center px-4'>Glissez-déposez vos images ici</p>
              <p className='text-c4 text-12 mb-4'>ou</p>
              <Button size='sm' className='bg-action text-selected rounded-8' startContent={<UploadIcon size={14} />} onPress={handleClick}>
                Charger des fichiers
              </Button>
            </div>

            {/* Zone YouTube séparée */}
            {onYouTubeUrlsChange && (
              <div className='flex flex-col items-center justify-center flex-1 h-full bg-c3 border-2 border-dashed border-c4 rounded-12 px-15'>
                <MovieIcon size={40} className='text-c4 mb-4' />
                <p className='text-c5 text-14 font-medium mb-4 text-center'>Ajouter une vidéo YouTube</p>
                <div className='flex flex-col gap-10 w-full max-w-[300px]'>
                  <Input
                    type='url'
                    placeholder='https://www.youtube.com/watch?v=...'
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    classNames={{
                      inputWrapper: 'bg-c1 border border-c3 rounded-8 w-full min-h-[40px]',
                      input: 'text-c6 text-14',
                    }}
                  />
                  <Button
                    size='sm'
                    className='bg-action text-selected rounded-8 w-full'
                    isDisabled={!isValidYouTubeUrl(youtubeUrlInput)}
                    onPress={() => {
                      if (isValidYouTubeUrl(youtubeUrlInput)) {
                        onYouTubeUrlsChange([...youtubeUrls, youtubeUrlInput]);
                        setYoutubeUrlInput('');
                        setShowAddInterface(false);
                        // Sélectionner la nouvelle vidéo ajoutée
                        setCurrentIndex(allMediaItems.length);
                      }
                    }}>
                    Ajouter la vidéo
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thumbnails Carousel - Toujours visible */}
      <div className='flex w-full justify-start items-center gap-10 flex-wrap'>
        {/* Thumbnails des médias existants */}
        {allMediaItems.map((media, index) => (
          <div key={media.id} className='relative'>
            <button
              onClick={() => {
                setCurrentIndex(index);
                setShowAddInterface(false);
                setEditingYoutubeUrl(null);
              }}
              className={`
                flex-shrink-0 w-[136px] h-[70px] rounded-12 overflow-hidden
                transition-all duration-200
                ${index === currentIndex && !showAddInterface ? 'border-2 border-c6' : 'border-2 border-transparent hover:border-gray-300'}
              `}>
              {media.isYouTube ? (
                // Thumbnail YouTube
                <div className='relative w-full h-full'>
                  <img src={media.preview} alt={media.name} className='w-full h-full object-cover' />
                  <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                    <MovieIcon size={20} className='text-white' />
                  </div>
                </div>
              ) : media.type === 'video' ? (
                <video src={media.url || media.preview} className='w-full h-full object-cover' />
              ) : (
                <img src={media.url || media.preview} alt={media.name} className='w-full h-full object-cover' />
              )}
            </button>
            {/* Badge for new files */}
            {!media.isExisting && !media.isYouTube && (
              <span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-action text-selected text-[10px] px-2 py-1 rounded-[4px] z-10'>+</span>
            )}
            {/* Badge YouTube */}
            {media.isYouTube && <span className='absolute bottom-1 right-1 bg-red-600 text-white text-[8px] px-1 rounded z-10'>YT</span>}
          </div>
        ))}

        {/* Bouton + pour ajouter - toujours visible */}
        {!disabled && allMediaItems.length < maxFiles && (
          <button
            onClick={() => setShowAddInterface(true)} // Afficher l'interface d'ajout
            className={`flex-shrink-0 w-[136px] h-[70px] rounded-12 border-2 border-dashed flex items-center justify-center transition-all duration-200 ${
              showAddInterface ? 'border-action bg-action/10' : 'border-c4 hover:border-action'
            }`}>
            <PlusIcon size={20} className={showAddInterface ? 'text-action' : 'text-c4'} />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type='file' multiple accept={acceptedTypes.join(',')} onChange={handleInputChange} className='hidden' />

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCancelRemove} size='sm'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1 !text-c6 text-16 font-medium'>Confirmer la suppression</ModalHeader>
          <ModalBody>
            <p className='text-c4'>
              {mediaToDelete?.isExisting ? 'Ce média sera définitivement supprimé. Cette action est irréversible.' : 'Voulez-vous retirer ce fichier de la liste ?'}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={handleCancelRemove}>
              Annuler
            </Button>
            <Button color='danger' onPress={handleConfirmRemove}>
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MediaDropzone;
