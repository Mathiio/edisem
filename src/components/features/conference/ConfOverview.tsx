import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, UserIcon, ShareIcon, MovieIcon } from '@/components/ui/icons';
import { motion, Variants } from 'framer-motion';
import { addToast, Skeleton, Link, Button, cn } from '@heroui/react';
import { AnnotationDropdown } from './AnnotationDropdown';

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

type ConfOverviewProps = {
  id: number;
  title: string;
  actant: string;
  actantId: number;
  university: string;
  picture: string;
  url: string;
  fullUrl: string;
  currentTime: number;
};

export const ConfOverviewCard: React.FC<ConfOverviewProps> = ({
  id,
  title,
  actant,
  actantId,
  university,
  picture,
  url,
  fullUrl,
  currentTime,
}) => {
  const [videoUrl, setVideoUrl] = useState<string>(url);
  const [buttonText, setButtonText] = useState<string>('séance complète');
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [currentTime, true] }),
        '*',
      );
    } else {
      console.log('iframeRef ou contentWindow non disponible');
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoUrl) {
      const updatedUrl = new URL(videoUrl);
      updatedUrl.searchParams.set('enablejsapi', '1');
      setVideoUrl(updatedUrl.toString());
    }
  }, [url, fullUrl]);

  const openActant = () => {
    navigate(`/conferencier/${actantId}`);
  };

  const truncateTitle = (title: string, maxLength: number) => {
    if (title.length > maxLength) {
      return title.slice(0, maxLength) + '...';
    }
    return title;
  };

  const changeLink = () => {
    if (videoUrl === url) {
      setVideoUrl(fullUrl);
      setButtonText('conférence');
    } else {
      setVideoUrl(url);
      setButtonText('séance complète');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(videoUrl).then(() => {});
  };

  return (
    <motion.div className='w-full flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
      <motion.div variants={itemVariants} className='rounded-14 lg:w-full overflow-hidden'>
        {videoUrl ? (
          <iframe
            ref={iframeRef}
            className='lg:w-[100%] lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] xs:h-[250px]'
            title='YouTube Video'
            width='100%'
            src={videoUrl}
            allowFullScreen></iframe>
        ) : (
          <UnloadedCard />
        )}
      </motion.div>
      <motion.div variants={itemVariants} className='w-full flex flex-col gap-25'>
        <h1 className='font-medium text-c6 text-24'>{title}</h1>
        <div className='w-full flex flex-col gap-10'>
          <div className='w-full flex justify-between gap-10 items-center'>
            <Link className='w-fit flex justify-start gap-10 items-center cursor-pointer' onClick={openActant}>
              {picture ? (
                <img src={picture} alt='Avatar' className='w-9 h-9 rounded-[7px] object-cover' />
              ) : (
                <UserIcon
                  size={22}
                  className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200'
                />
              )}
              <div className='flex flex-col items-start gap-0.5'>
                <h3 className='text-c6 font-medium text-16 gap-10 transition-all ease-in-out duration-200'>{actant}</h3>
                <p className='text-c4 font-extralight text-14 gap-10 transition-all ease-in-out duration-200'>
                  {truncateTitle(university, 48)}
                </p>
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
              {url !== fullUrl && fullUrl !== '' && (
                <Button
                  size='md'
                  className='text-16 h-auto px-10 py-5 rounded-8 text-c6 hover:text-c6 gap-2 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'
                  onClick={changeLink}>
                  <MovieIcon size={12} />
                  {buttonText}
                </Button>
              )}
              <AnnotationDropdown
                id={id}
                content='Exemple de contenu obligatoire'
                image='https://example.com/image.jpg'
                actant='Jean Dupont'
                type='Conférence'
              />
            </div>
          </div>
        </div>
      </motion.div>
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
          Aucune vidéo n'est liée au contenu de cette conférence. Veuillez vérifier plus tard ou explorer d'autres
          sections de notre site.
        </p>
      </div>
    </div>
  );
};
