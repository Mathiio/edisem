import React, { useState, useRef, useCallback } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, addToast } from '@heroui/react';
import { Button } from '@/theme/components/button';
import { CameraIcon, CrossIcon, UploadIcon, PlusIcon, ArrowIcon } from '@/components/ui/icons';
import { Splide, SplideTrack, SplideSlide } from '@splidejs/react-splide';

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
export const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  value = [],
  onChange,
  existingMedias = [],
  onRemoveExisting,
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

  // Combine existing medias with new files
  const allMediaItems: MediaFile[] = [
    // Médias existants (URLs)
    ...existingMedias.map((url, index) => ({
      id: `existing-${index}`,
      url,
      preview: url,
      type: (isVideo(url) ? 'video' : 'image') as 'video' | 'image',
      name: `Média existant ${index + 1}`,
      isExisting: true,
    })),
    // Nouveaux fichiers uploadés
    ...value.map((file) => ({
      ...file,
      isExisting: false,
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

    if (mediaToDelete.isExisting) {
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
        {allMediaItems.length > 0 && currentMedia ? (
          // Show current media
          <div className={`relative w-full ${className} `}>
            {currentMedia.type === 'video' ? (
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
                {' '}
                <span>Supprimer</span>
                <CrossIcon size={14} className='text-14 w-[14px] h-[14px]' />
              </Button>
            )}
          </div>
        ) : (
          // Empty state - dropzone
          <div
            className={`
              flex flex-col items-center justify-center
              w-full h-full bg-c3
              border-2 border-dashed rounded-12
              ${isDragging ? 'border-action' : 'border-c4'}
              cursor-pointer
            `}
            onClick={handleClick}>
            <CameraIcon size={48} className='text-c4 mb-4' />
            <p className='text-c5 text-16 font-medium mb-2'>Glissez-déposez vos médias ici</p>
            <p className='text-c4 text-14 mb-4'>ou</p>
            <Button className='bg-action text-selected rounded-8' startContent={<UploadIcon size={16} />} onPress={handleClick}>
              Charger des fichiers
            </Button>
            <p className='text-c4 text-12 mt-4'>Images et vidéos acceptées (max {maxFiles} fichiers)</p>
          </div>
        )}
      </div>

      {/* Splide Thumbnails Carousel */}
      {allMediaItems.length > 0 && (
        <Splide
          options={{
            perPage: 3,
            gap: '1rem',
            pagination: false,
            perMove: 1,
            speed: 1000,
            autoWidth: true,
          }}
          hasTrack={false}
          aria-label='Galerie de médias'
          className='flex w-full justify-between items-center gap-25'>
          <SplideTrack className='w-full'>
            {allMediaItems.map((media, index) => (
              <SplideSlide key={media.id}>
                <div className='relative'>
                  <button
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      flex-shrink-0 w-[136px] h-[70px] rounded-12 overflow-hidden
                      transition-all duration-200
                      ${index === currentIndex ? 'border-2 border-c6' : 'border-2 border-transparent hover:border-gray-300'}
                    `}>
                    {media.type === 'video' ? (
                      <video src={media.url || media.preview} className='w-full h-full object-cover' />
                    ) : (
                      <img src={media.url || media.preview} alt={media.name} className='w-full h-full object-cover' />
                    )}
                  </button>
                  {/* Badge for new files */}
                  {!media.isExisting && (
                    <span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-action text-selected text-[10px] px-2 py-1 rounded-[4px] z-10'>
                      +
                    </span>
                  )}
                </div>
              </SplideSlide>
            ))}
            {/* Add button in carousel */}
            {!disabled && allMediaItems.length < maxFiles && (
              <SplideSlide>
                <button
                  onClick={handleClick}
                  className='flex-shrink-0 w-[136px] h-[70px] rounded-12 border-2 border-dashed border-c4 flex items-center justify-center hover:border-action transition-all duration-200'>
                  <PlusIcon size={20} className='text-c4' />
                </button>
              </SplideSlide>
            )}
          </SplideTrack>
          <div className='flex justify-between items-center'>
            <div className='splide__arrows relative flex gap-10'>
              <Button
                size='sm'
                className='p-0 min-w-[32px] min-h-[32px] text-selected bg-action splide__arrow transform translate-y-0 splide__arrow--prev relative left-0 focus:outline-none'>
                <ArrowIcon size={20} transform='rotate(180deg)' />
              </Button>
              <Button
                size='sm'
                className='p-0 min-w-[32px] min-h-[32px] text-selected bg-action splide__arrow transform translate-y-0 splide__arrow--next relative right-0 focus:outline-none'>
                <ArrowIcon size={20} />
              </Button>
            </div>
          </div>
        </Splide>
      )}

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
