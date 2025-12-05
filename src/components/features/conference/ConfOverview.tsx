import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, UserIcon, ShareIcon, MovieIcon } from '@/components/ui/icons';
import { motion, Variants } from 'framer-motion';
import { addToast, Skeleton, Link, Button, cn, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { AnnotationDropdown } from './AnnotationDropdown';
import { Conference } from '@/types/ui';

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
  conf: Conference;
  currentTime: number;
  type?: string;
};

export const ConfOverviewCard: React.FC<ConfOverviewProps> = ({ conf, currentTime, type }) => {
  const [videoUrl, setVideoUrl] = useState<string>(conf.url);
  const [buttonText, setButtonText] = useState<string>('séance complète');
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Remettre videoUrl à conf.url quand on change de conférence
  useEffect(() => {
    // Vérifier si conf.url est une URL valide avant de créer l'objet URL
    if (conf.url && typeof conf.url === 'string' && conf.url.trim() !== '') {
      try {
        // Ajouter un timestamp pour forcer le rechargement de l'iframe même avec la même URL
        const baseUrl = conf.url;
        const urlWithTimestamp = new URL(baseUrl);
        urlWithTimestamp.searchParams.set('t', Date.now().toString());
        setVideoUrl(urlWithTimestamp.toString());
        setButtonText('séance complète');
      } catch (urlError) {
        console.warn('Invalid URL provided:', conf.url, urlError);
        // Si l'URL n'est pas valide, utiliser une chaîne vide pour éviter l'erreur
        setVideoUrl('');
      }
    } else {
      // Si pas d'URL valide, définir une URL vide
      setVideoUrl('');
    }
  }, [conf.url]);

  useEffect(() => {
    console.log('🎬 ConfOverviewCard - Changement de temps détecté:', {
      currentTime,
      confId: conf.id,
      confTitle: conf.title,
      iframeExists: !!iframeRef.current,
      contentWindowExists: !!iframeRef.current?.contentWindow,
    });

    if (iframeRef.current && iframeRef.current.contentWindow) {
      const message = JSON.stringify({ event: 'command', func: 'seekTo', args: [currentTime, true] });
      console.log('📤 ConfOverviewCard - Envoi message à YouTube:', message);
      iframeRef.current.contentWindow.postMessage(message, '*');
      console.log('✅ ConfOverviewCard - Message envoyé à YouTube');
    } else {
      console.log('❌ ConfOverviewCard - iframeRef ou contentWindow non disponible');
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoUrl && videoUrl.trim() !== '') {
      try {
        const updatedUrl = new URL(videoUrl);
        updatedUrl.searchParams.set('enablejsapi', '1');
        setVideoUrl(updatedUrl.toString());
      } catch (urlError) {
        console.warn('Invalid video URL for jsapi:', videoUrl, urlError);
        // Si l'URL n'est pas valide, ne rien faire
      }
    }
  }, [videoUrl]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      // Convertir en nombre si nécessaire
      const time = typeof currentTime === 'string' ? parseInt(currentTime, 10) : currentTime;

      const message = JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [time, true],
      });

      iframeRef.current.contentWindow.postMessage(message, '*');
    }
  }, [currentTime]);

  const openActant = (id: string) => {
    navigate(`/intervenant/${id}`);
  };

  const changeLink = () => {
    if (videoUrl === conf.url) {
      // Vérifier si conf.fullUrl est une URL valide
      if (conf.fullUrl && typeof conf.fullUrl === 'string' && conf.fullUrl.trim() !== '') {
        setVideoUrl(conf.fullUrl);
        setButtonText('conférence');
      } else {
        console.warn('Invalid fullUrl:', conf.fullUrl);
      }
    } else {
      // Vérifier si conf.url est une URL valide
      if (conf.url && typeof conf.url === 'string' && conf.url.trim() !== '') {
        setVideoUrl(conf.url);
        setButtonText('séance complète');
      } else {
        console.warn('Invalid url:', conf.url);
      }
    }
  };

  const copyToClipboard = () => {
    if (videoUrl && videoUrl.trim() !== '') {
      navigator.clipboard.writeText(videoUrl).then(() => {});
    }
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
        <div className='flex items-center gap-15'>
          <h1 className='font-medium text-c6 text-24'>{conf.title}</h1>
          {type && <span className='text-14 w-fit text-c5 px-10 py-5 bg-c2 rounded-8 border border-c3 whitespace-nowrap'>{type}</span>}
        </div>
        <div className='w-full flex flex-col gap-10'>
          <div className='w-full flex justify-between gap-10 items-center'>
            <div className='w-fit flex justify-start gap-10 items-center'>
              {/* Premier actant */}
              {conf.actant && Array.isArray(conf.actant) && conf.actant.length > 0 && (
                <Link className='w-fit flex justify-start gap-10 items-center cursor-pointer' onClick={() => openActant(conf.actant[0].id)}>
                  {conf.actant[0]?.picture ? (
                    <img src={conf.actant[0].picture} alt='Avatar' className='w-9 h-9 rounded-[7px] object-cover' />
                  ) : (
                    <UserIcon size={22} className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200' />
                  )}
                  <div className='flex flex-col items-start gap-0.5'>
                    <h3 className='text-c6 font-medium text-16 gap-10 transition-all ease-in-out duration-200'>
                      {conf.actant[0]?.firstname} {conf.actant[0]?.lastname}
                    </h3>
                    {conf.actant[0]?.jobTitle && Array.isArray(conf.actant[0].jobTitle) && conf.actant[0].jobTitle.length > 0 ? (
                      <p className='text-c4 font-extralight text-14 gap-10 transition-all ease-in-out duration-200'>{conf.actant[0].jobTitle[0]?.title}</p>
                    ) : (
                      <p className='text-c4 font-extralight text-14 gap-10 transition-all ease-in-out duration-200'>{conf.actant[0]?.universities?.[0]?.shortName || ''}</p>
                    )}
                  </div>
                </Link>
              )}

              {conf.actant && Array.isArray(conf.actant) && conf.actant.length > 1 && (
                <Dropdown>
                  <DropdownTrigger className='p-0'>
                    <Button
                      size='md'
                      className='text-16 h-full min-h-[36px] px-10 py-5 rounded-8 text-c6 hover:text-c6 gap-2 border-2 border-c4 bg-c1 hover:bg-c2 transition-all ease-in-out duration-200'>
                      <h3 className='text-c6 font-medium h-full text-14 gap-10 transition-all ease-in-out duration-200'>+{conf.actant.length - 1}</h3>
                    </Button>
                  </DropdownTrigger>

                  <DropdownMenu aria-label='Autres intervenants' className='p-10 bg-c2 rounded-12'>
                    {conf.actant.slice(1).map((actant: any) => (
                      <DropdownItem key={actant.id} className={`p-0`} onClick={() => openActant(actant.id)}>
                        <div className={`flex items-center gap-15 w-full px-15 py-10 rounded-8 transition-all ease-in-out duration-200 hover:bg-c3 text-c6`}>
                          {actant.picture ? (
                            <img src={actant.picture} alt='Avatar' className='w-9 h-9 rounded-[7px] object-cover' />
                          ) : (
                            <UserIcon size={22} className='text-default-500 hover:text-default-action hover:opacity-100 transition-all ease-in-out duration-200' />
                          )}
                          <div className='flex flex-col items-start gap-0.5'>
                            <span className='text-16 font-medium'>
                              {actant.firstname} {actant.lastname}
                            </span>
                            {actant.jobTitle && Array.isArray(actant.jobTitle) && actant.jobTitle.length > 0 ? (
                              <span className='text-14 text-c4 font-extralight'>{actant.jobTitle[0]?.title}</span>
                            ) : (
                              <span className='text-14 text-c4 font-extralight'>{actant.universities?.[0]?.shortName || ''}</span>
                            )}
                          </div>
                        </div>
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>

            <div className='w-fit flex justify-between gap-10 items-center'>
              <Button
                className='hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] h-fit cursor-pointer bg-c2 flex flex-row rounded-8 border-2 border-c3 items-center justify-center px-10 py-5 text-16 gap-10 text-c6 transition-all ease-in-out duration-200'
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
              {conf.url &&
                conf.fullUrl &&
                typeof conf.url === 'string' &&
                typeof conf.fullUrl === 'string' &&
                conf.url.trim() !== '' &&
                conf.fullUrl.trim() !== '' &&
                conf.url !== conf.fullUrl && (
                  <Button
                    size='md'
                    className='hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] h-fit cursor-pointer bg-c2 flex flex-row rounded-8 border-2 border-c3 items-center justify-center px-10 py-5 text-16 gap-10 text-c6 transition-all ease-in-out duration-200'
                    onClick={changeLink}>
                    <MovieIcon size={12} />
                    {buttonText}
                  </Button>
                )}
              <AnnotationDropdown id={Number(conf.id)} content='Exemple de contenu obligatoire' image='https://example.com/image.jpg' actant='Jean Dupont' type='Conférence' />
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
      <Skeleton className='rounded-14 lg:w-[100%] lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] xs:h-[250px]'></Skeleton>
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
          <Skeleton className='w-[40%] rounded-8'>
            <p className='font-semibold text-32'>_</p>
          </Skeleton>
          <div className='w-[30%] flex justify-end gap-10'>
            <Skeleton className='w-[100%] rounded-8'>
              <p className='font-semibold text-32'>_</p>
            </Skeleton>
            <Skeleton className='w-[100%] rounded-8'>
              <p className='font-semibold text-32'>_</p>
            </Skeleton>
          </div>
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
