import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, UserIcon, ShareIcon, MovieIcon, ArrowIcon } from '@/components/ui/icons';
import { motion, Variants } from 'framer-motion';
import { addToast, Skeleton, Link, Button, cn } from '@heroui/react';
import { AnnotationDropdown } from '../conference/AnnotationDropdown';
import { Splide, SplideTrack, SplideSlide } from '@splidejs/react-splide';
import MediaViewer from '../conference/MediaViewer';

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
};

export const ExpOverviewCard: React.FC<ExpOverviewProps> = ({ id, title, personnes, medias, fullUrl, buttonText, percentage, status, type }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);

  const navigate = useNavigate();

  const openActant = () => {
    navigate(`/conferencier/${personnes[0]?.id}`);
  };

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
        {medias && medias.length > 0 ? (
          <div className='flex flex-col gap-10'>
            <MediaViewer
              src={medias[currentMediaIndex]}
              alt={`Média ${currentMediaIndex + 1}`}
              className='lg:w-[100%] lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] xs:h-[250px] rounded-12 overflow-hidden'
              isVideo={medias[currentMediaIndex].includes('.mov')}
            />

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
              aria-label='...'
              className='flex w-full justify-between items-center gap-25'>
              <SplideTrack className='w-full'>
                {medias.map((media, index) => (
                  <SplideSlide key={index}>
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`flex-shrink-0 w-[136px] h-[50px] rounded-12 overflow-hidden transition-all duration-200 ${
                        index === currentMediaIndex ? 'border-2 border-c6' : 'border-2 border-transparent hover:border-gray-300'
                      }`}>
                      {media.includes('.mov') ? (
                        <video src={media} className='w-full h-full object-cover' />
                      ) : (
                        <img src={media} alt={`Miniature ${index + 1}`} className='w-full h-full object-cover' />
                      )}
                    </button>
                  </SplideSlide>
                ))}
              </SplideTrack>
              <div className=' flex justify-between items-center'>
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
          </div>
        ) : (
          <UnloadedCard />
        )}
      </motion.div>

      <motion.div variants={itemVariants} className='w-full flex flex-col gap-25'>
        <div className='flex items-center gap-15'>
          <h1 className='font-medium text-c6 text-24'>{title}</h1>
          {type && <span className='text-14 text-c5 px-10 py-5 bg-c2 rounded-8 border border-c3'>{type}</span>}
        </div>
        <div className='w-full flex flex-col gap-10'>
          <div className='w-full flex justify-between gap-10 items-center'>
            <Link className='w-fit flex justify-start gap-10 items-center cursor-pointer' onClick={openActant}>
              {personnes[0]?.thumbnail ? (
                <img src={personnes[0]?.thumbnail} alt='Avatar' className='w-9 h-9 rounded-[7px] object-cover' />
              ) : (
                <UserIcon size={22} className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200' />
              )}
              <div className='flex flex-col items-start gap-0.5'>
                <h3 className='text-c6 font-medium text-16 gap-10 transition-all ease-in-out duration-200'>{personnes[0]?.name}</h3>
                {personnes[0]?.jobTitle && Array.isArray(personnes[0].jobTitle) && personnes[0].jobTitle.length > 0 && (
                  <p className='text-c4 font-extralight text-14'>{personnes[0].jobTitle[0]?.title}</p>
                )}
              </div>
            </Link>

            <div className='w-fit flex justify-between gap-10 items-center'>
              <Button
                size='md'
                className='text-16 h-auto px-10 py-5 rounded-8 text-c6 hover:text-c6 gap-2 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'
                onClick={copyToClipboard}
                onPress={() => {
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
                  onClick={() => window.open(fullUrl, '_blank')}>
                  <MovieIcon size={12} />
                  {buttonText}
                </Button>
              )}

              <AnnotationDropdown id={id} content='Exemple de contenu obligatoire' image='https://example.com/image.jpg' actant='Jean Dupont' type='Conférence' />
            </div>
          </div>
        </div>
      </motion.div>
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
