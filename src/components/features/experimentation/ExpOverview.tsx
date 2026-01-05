import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, UserIcon, ShareIcon, MovieIcon, ArrowIcon, PlusIcon, CrossIcon, UploadIcon } from '@/components/ui/icons';
import { motion, Variants } from 'framer-motion';
import { addToast, Skeleton, Link, Button, cn, DropdownMenu, Dropdown, DropdownItem, DropdownTrigger } from '@heroui/react';
import { AnnotationDropdown } from '../conference/AnnotationDropdown';
import { Splide, SplideTrack, SplideSlide } from '@splidejs/react-splide';
import MediaViewer from '../conference/MediaViewer';
import { MediaFile } from '@/components/features/forms/MediaDropzone';

// Helper function to get the correct route based on person type
const getPersonRoute = (person: any): string => {
  if (!person?.type) {
    const route = `/conferencier/${person?.id}`;
    // console.log('🔗 getPersonRoute - No type, using fallback:', { person, route });
    return route;
  }

  let route;
  switch (person.type) {
    case 'actant':
      route = `/intervenant/${person.id}`;
      break;
    case 'student':
      route = `/intervenant/${person.id}`; // Pour l'instant, même route que les actants
      break;
    case 'personne':
      route = `/personne/${person.id}`;
      break;
    default:
      route = `/conferencier/${person?.id}`; // fallback
      break;
  }

  // console.log('🔗 getPersonRoute - Determined route:', { person, type: person.type, route });
  return route;
};

// Helper function to get display name based on person type
export const getPersonDisplayName = (person: any): string => {
  if (!person) return '';

  switch (person.type) {
    case 'personne':
      return person.name || `${person.firstName || ''} ${person.lastName || ''}`.trim();
    case 'actant':
    case 'student':
      return `${person.firstname || ''} ${person.lastname || ''}`.trim();
    default:
      return person.name || person.title || 'Nom inconnu';
  }
};

// Helper function to get job title based on person type
const getPersonJobTitle = (person: any): string | null => {
  if (!person) return null;

  switch (person.type) {
    case 'personne':
      return person.jobTitle && Array.isArray(person.jobTitle) && person.jobTitle.length > 0 ? person.jobTitle[0]?.title : null;
    case 'actant':
    case 'student':
      // Les actants et étudiants n'ont pas de jobTitle dans les données actuelles
      return null;
    default:
      return null;
  }
};

// Helper function to get picture URL
export const getPersonPicture = (person: any): string | null => {
  if (!person) return null;
  return person.picture || null;
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 10 } },
};

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

type ExpOverviewProps = {
  id: number;
  title: string;
  personnes: any[];
  medias: string[]; // Tableau de liens d'images
  fullUrl: string;
  currentTime: number;
  percentage: number;
  status: string;
  buttonText: string;
  type?: string;
  // Props pour le mode édition
  isEditing?: boolean;
  onTitleChange?: (value: string) => void;
  onMediasChange?: (files: MediaFile[]) => void;
  onAddPerson?: () => void;
  onLinkChange?: (value: string) => void;
  mediaFiles?: MediaFile[]; // Fichiers médias en mode édition
  removedMediaIndexes?: number[]; // Indexes des médias existants supprimés
  onRemoveExistingMedia?: (index: number) => void; // Callback pour supprimer un média existant
};

export const ExpOverviewCard: React.FC<ExpOverviewProps> = ({
  id,
  title = '',
  personnes = [],
  medias = [],
  fullUrl = '',
  buttonText = 'Voir plus',
  percentage = 0,
  status = '',
  type,
  isEditing = false,
  onTitleChange: _onTitleChange,
  onMediasChange,
  onAddPerson: _onAddPerson,
  onLinkChange: _onLinkChange,
  mediaFiles = [],
  removedMediaIndexes = [],
  onRemoveExistingMedia,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();

  // Combine existing medias with new mediaFiles for editing (excluding removed ones)
  const allMediaItems = isEditing
    ? [
        // Médias existants (URLs) - filtrer ceux qui ont été supprimés
        ...medias
          .map((url, index) => ({
            id: `existing-${index}`,
            url,
            preview: url,
            type: (url.includes('.mov') || url.includes('.mp4') ? 'video' : 'image') as 'video' | 'image',
            name: `Média existant ${index + 1}`,
            isExisting: true,
            originalIndex: index,
          }))
          .filter((_, index) => !removedMediaIndexes.includes(index)),
        // Nouveaux fichiers uploadés
        ...mediaFiles.map((file) => ({
          ...file,
          isExisting: false,
          originalIndex: -1,
        })),
      ]
    : [];

  const currentEditMedia = allMediaItems[currentMediaIndex];

  // Handle file selection
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newMediaFiles: MediaFile[] = [];
    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file);
      newMediaFiles.push({
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        name: file.name,
      });
    });
    if (newMediaFiles.length > 0) {
      onMediasChange?.([...mediaFiles, ...newMediaFiles]);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing) setIsDragging(true);
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
    if (isEditing) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove a media
  const handleRemoveMedia = (media: any) => {
    if (media.isExisting) {
      // Supprimer un média existant via callback
      if (onRemoveExistingMedia && media.originalIndex !== undefined) {
        onRemoveExistingMedia(media.originalIndex);
      }
    } else {
      // Supprimer un nouveau fichier
      const updatedFiles = mediaFiles.filter((f) => f.id !== media.id);
      onMediasChange?.(updatedFiles);
    }
    // Ajuster l'index si nécessaire
    if (currentMediaIndex >= allMediaItems.length - 1 && currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    } else if (allMediaItems.length <= 1) {
      setCurrentMediaIndex(0);
    }
  };

  // console.log('🎨 ExpOverviewCard - Received props:', {
  //   id,
  //   title,
  //   personnes,
  //   medias,
  //   fullUrl,
  //   buttonText,
  //   percentage,
  //   status,
  //   type,
  //   personnesTypes: personnes?.map((p) => ({ name: p?.name, type: p?.type, id: p?.id })),
  //   personnesCount: personnes?.length,
  // });

  const copyToClipboard = () => {
    // Copie l'image actuellement affichée
    if (medias && medias[currentMediaIndex]) {
      navigator.clipboard.writeText(medias[currentMediaIndex]).then(() => {});
    }
  };

  const clampedPercentage = Math.max(0, Math.min(100, Math.round(percentage ?? 0)));
  const totalSegments = 5;
  const segmentSpan = 100 / totalSegments;

  return (
    <motion.div className='w-full flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
      <motion.div variants={itemVariants} className=' lg:w-full overflow-hidden relative'>
        {/* Mode édition: même design que lecture mais avec contrôles d'édition */}
        {isEditing ? (
          <div className='flex flex-col gap-10'>
            {/* Zone principale - MediaViewer ou zone de drop */}
            <div
              className={`relative lg:w-[100%] lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] xs:h-[250px] rounded-12 overflow-hidden transition-all duration-200 ${
                isDragging ? 'ring-2 ring-action bg-c2' : ''
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}>
              {allMediaItems.length > 0 && currentEditMedia ? (
                <>
                  {/* Affichage du média actuel */}
                  {currentEditMedia.type === 'video' ? (
                    <video src={currentEditMedia.url || currentEditMedia.preview} className='w-full h-full object-cover' controls />
                  ) : (
                    <img src={currentEditMedia.url || currentEditMedia.preview} alt={currentEditMedia.name} className='w-full h-full object-cover' />
                  )}

                  {/* Bouton supprimer sur le média actuel */}
                  <Button
                    isIconOnly
                    size='sm'
                    className='absolute top-3 right-3 bg-c1/80 hover:bg-danger text-c6 hover:text-white rounded-full z-10'
                    onPress={() => handleRemoveMedia(currentEditMedia)}>
                    <CrossIcon size={14} />
                  </Button>

                  {/* Indicateur nouveau/existant */}
                  {!currentEditMedia.isExisting && <span className='absolute top-3 left-3 bg-action text-selected text-12 px-8 py-4 rounded-8 z-10'>Nouveau</span>}

                  {/* Bouton ajouter */}
                  <Button
                    size='sm'
                    className='absolute bottom-3 right-3 bg-action text-selected rounded-8 z-10'
                    startContent={<UploadIcon size={14} />}
                    onPress={() => fileInputRef.current?.click()}>
                    Ajouter
                  </Button>
                </>
              ) : (
                /* Zone vide - invitation à ajouter */
                <div
                  className={`flex flex-col items-center justify-center w-full h-full bg-c3 rounded-12 border-2 border-dashed ${
                    isDragging ? 'border-action' : 'border-c4'
                  } cursor-pointer`}
                  onClick={() => fileInputRef.current?.click()}>
                  <CameraIcon size={48} className='text-c4 mb-4' />
                  <p className='text-c5 text-16 font-medium mb-2'>Glissez-déposez vos médias ici</p>
                  <p className='text-c4 text-14 mb-4'>ou</p>
                  <Button className='bg-action text-selected rounded-8' startContent={<UploadIcon size={16} />} onPress={() => fileInputRef.current?.click()}>
                    Charger des fichiers
                  </Button>
                </div>
              )}
            </div>

            {/* Carrousel de thumbnails en mode édition */}
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
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`flex-shrink-0 w-[136px] h-[50px] rounded-12 overflow-hidden transition-all duration-200 ${
                            index === currentMediaIndex ? 'border-2 border-c6' : 'border-2 border-transparent hover:border-gray-300'
                          }`}>
                          {media.type === 'video' ? (
                            <video src={media.url || media.preview} className='w-full h-full object-cover' />
                          ) : (
                            <img src={media.url || media.preview} alt={media.name} className='w-full h-full object-cover' />
                          )}
                        </button>
                        {/* Badge nouveau */}
                        {!media.isExisting && <span className='absolute -top-1 -right-1 bg-action text-selected text-10 px-4 py-1 rounded-full z-10'>+</span>}
                      </div>
                    </SplideSlide>
                  ))}
                  {/* Bouton ajouter dans le carrousel */}
                  <SplideSlide>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className='flex-shrink-0 w-[136px] h-[50px] rounded-12 border-2 border-dashed border-c4 flex items-center justify-center hover:border-action transition-all duration-200'>
                      <PlusIcon size={20} className='text-c4' />
                    </button>
                  </SplideSlide>
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

            {/* Input fichier caché */}
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='image/*,video/*'
              onChange={(e) => {
                handleFiles(e.target.files);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className='hidden'
            />
          </div>
        ) : medias && medias.length > 0 ? (
          <div className='flex flex-col gap-10'>
            <MediaViewer
              src={medias[currentMediaIndex]}
              alt={`Média ${currentMediaIndex + 1}`}
              className='lg:w-[100%] lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] xs:h-[250px] rounded-12 overflow-hidden'
              isVideo={medias[currentMediaIndex].includes('.mov') || medias[currentMediaIndex].includes('.mp4')}
            />

            {medias.length > 1 && (
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
                  {medias.map((media, index) => (
                    <SplideSlide key={index}>
                      <button
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`flex-shrink-0 w-[136px] h-[50px] rounded-12 overflow-hidden transition-all duration-200 ${
                          index === currentMediaIndex ? 'border-2 border-c6' : 'border-2 border-transparent hover:border-gray-300'
                        }`}>
                        {media.includes('.mov') || media.includes('.mp4') ? (
                          <video src={media} className='w-full h-full object-cover' />
                        ) : (
                          <img src={media} alt={`Miniature ${index + 1}`} className='w-full h-full object-cover' />
                        )}
                      </button>
                    </SplideSlide>
                  ))}
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
          </div>
        ) : (
          <UnloadedCard />
        )}
      </motion.div>

      {/* Section titre/personnes/liens - masquée en mode edit car dans la section unifiée */}
      {!isEditing && (
        <motion.div variants={itemVariants} className='w-full flex flex-col gap-25'>
          <div className='flex items-center gap-15'>
            <h1 className='font-medium text-c6 text-24'>{title}</h1>
            {type && <span className='text-14 text-c5 px-10 py-5 bg-c2 rounded-8 border border-c3 whitespace-nowrap'>{type}</span>}
          </div>
          <div className='w-full flex flex-col gap-10'>
            <div className='w-full flex justify-between gap-10 items-center'>
              <div className='w-fit flex justify-start gap-10 items-center'>
                {Array.isArray(personnes) &&
                  personnes.length > 0 &&
                  (personnes[0]?.id != null ? (
                    <Link href={getPersonRoute(personnes[0])} className='w-fit flex justify-start gap-10 items-center'>
                      {getPersonPicture(personnes[0]) ? (
                        <img src={getPersonPicture(personnes[0]) ?? ''} alt='Avatar' className='w-9 h-9 rounded-[7px] object-cover' />
                      ) : (
                        <UserIcon size={22} className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200' />
                      )}
                      <div className='flex flex-col items-start gap-0.5'>
                        <h3 className='text-c6 font-medium text-16 gap-10 transition-all ease-in-out duration-200'>{getPersonDisplayName(personnes[0])}</h3>
                        {getPersonJobTitle(personnes[0]) && <p className='text-c4 font-extralight text-14'>{getPersonJobTitle(personnes[0])}</p>}
                      </div>
                    </Link>
                  ) : (
                    <div className='w-fit flex justify-start gap-10 items-center'>
                      {getPersonPicture(personnes[0]) ? (
                        <img src={getPersonPicture(personnes[0]) ?? ''} alt='Avatar' className='w-9 h-9 rounded-[7px] object-cover' />
                      ) : (
                        <UserIcon size={22} className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200' />
                      )}
                      <div className='flex flex-col items-start gap-0.5'>
                        <h3 className='text-c6 font-medium text-16 gap-10 transition-all ease-in-out duration-200'>{getPersonDisplayName(personnes[0])}</h3>
                        {getPersonJobTitle(personnes[0]) && <p className='text-c4 font-extralight text-14'>{getPersonJobTitle(personnes[0])}</p>}
                      </div>
                    </div>
                  ))}
                {Array.isArray(personnes) && personnes.length > 1 && (
                  <Dropdown>
                    <DropdownTrigger className='p-0'>
                      <Button
                        size='md'
                        className='text-16 h-full min-h-[36px]  px-10 py-5 rounded-8 text-c6 hover:text-c6 gap-2 border-2 border-c6 bg-c1 hover:bg-c2 transition-all ease-in-out duration-200'>
                        <h3 className='text-c6 font-medium h-full text-14 gap-10 transition-all ease-in-out duration-200'>+ {personnes.length - 1}</h3>
                      </Button>
                    </DropdownTrigger>

                    <DropdownMenu aria-label='View options' className='p-10 bg-c2 rounded-12'>
                      {Array.isArray(personnes) && personnes.length > 1
                        ? personnes.slice(1).map((option: any, index: number) => (
                            <DropdownItem
                              key={option.id || `person-${index}`}
                              className={`p-0`}
                              onPress={() => option.id != null && navigate(getPersonRoute(option))}
                              isDisabled={option.id == null}>
                              <div className={`flex items-center gap-15 w-full px-15 py-10 rounded-8 transition-all ease-in-out duration-200 hover:bg-c3 text-c6`}>
                                {getPersonPicture(option) ? (
                                  <img src={getPersonPicture(option) ?? ''} alt='Avatar' className='w-9 h-9 rounded-[7px] object-cover' />
                                ) : (
                                  <UserIcon size={22} className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200' />
                                )}
                                <div className='flex flex-col items-start gap-0.5'>
                                  <span className='text-16'>{getPersonDisplayName(option)}</span>
                                  {getPersonJobTitle(option) && <span className='text-14 text-c4 font-extralight'>{getPersonJobTitle(option)}</span>}
                                </div>
                              </div>
                            </DropdownItem>
                          ))
                        : null}
                    </DropdownMenu>
                  </Dropdown>
                )}
              </div>

              {/* Boutons de partage et lien externe */}
              <div className='w-fit flex justify-between gap-10 items-center'>
                <Button
                  size='md'
                  className='text-16 h-auto px-10 py-5 rounded-8 text-c6 hover:text-c6 gap-2 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'
                  onPress={() => {
                    copyToClipboard();
                    addToast({
                      title: 'Lien copié',
                      classNames: {
                        base: cn(['text-c6', 'mb-4']),
                        icon: 'w-6 h-6 fill-current text-c6',
                      },
                    });
                  }}>
                  <ShareIcon size={12} />
                  Partager
                </Button>

                {fullUrl !== '' && (
                  <Button
                    size='md'
                    className='text-16 h-auto px-10 py-5 rounded-8 text-c6 hover:text-c6 gap-2 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'
                    onPress={() => window.open(fullUrl, '_blank')}>
                    <MovieIcon size={12} />
                    {buttonText}
                  </Button>
                )}

                <AnnotationDropdown id={id} content='Exemple de contenu obligatoire' image='https://example.com/image.jpg' actant='Jean Dupont' type='Conférence' />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {percentage > 0 && (
        <motion.div variants={itemVariants} className='w-full flex justify-between items-center flex-row gap-20'>
          <div className='w-full'>
            <div className='grid grid-cols-5 gap-2'>
              {Array.from({ length: totalSegments }).map((_, index) => {
                const segmentStart = index * segmentSpan;
                const segmentEnd = (index + 1) * segmentSpan;
                const segmentProgress = Math.max(0, Math.min(1, (clampedPercentage - segmentStart) / (segmentEnd - segmentStart)));
                const widthStyle = `${segmentProgress * 100}%`;
                return (
                  <div key={index} className='w-full h-2 bg-c3 rounded-8 overflow-hidden'>
                    <div className='h-full bg-action rounded-8' style={{ width: widthStyle }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className='flex flex-row justify-end items-center gap-10'>
            <span className='text-c6 font-medium text-16 whitespace-nowrap'>{status}</span>
            <span className='text-c6 font-medium text-16 whitespace-nowrap'>{clampedPercentage}%</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
export const ConfOverviewSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col gap-20'>
      <Skeleton className='rounded-14 lg:w-full lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] xs:h-[250px]'></Skeleton>
      <div className='flex flex-col gap-20'>
        <div className='flex flex-col gap-5'>
          <Skeleton className='w-[100%] rounded-8'>
            <p className='font-semibold text-24'>_</p>
          </Skeleton>
          <Skeleton className='w-[80%] rounded-8'>
            <p className='font-semibold text-24'>_</p>
          </Skeleton>
        </div>
        <div className='flex justify-between items-center'>
          <Skeleton className='w-[50%] rounded-8'>
            <p className='font-semibold text-16'>_</p>
          </Skeleton>
          <Skeleton className='w-[30%] rounded-8'>
            <p className='font-semibold text-24'>_</p>
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export const UnloadedCard: React.FC = () => {
  return (
    <div className='lg:w-[100%] lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] xs:h-[250px] flex flex-col items-center justify-center p-20 bg-c3 rounded-14 gap-20'>
      <CameraIcon size={42} className='text-c4' />
      <div className='w-[80%] flex flex-col justify-center items-center gap-10'>
        <h2 className='text-c5 text-32 font-semibold'>Oups !</h2>
        <p className='w-[400px] text-c5 text-16 text-regular text-center'>
          Aucune vidéo n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer d'autres sections de notre site.
        </p>
      </div>
    </div>
  );
};
