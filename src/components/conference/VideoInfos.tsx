import React, { useState } from 'react';
import { Link, Tooltip, Button } from '@nextui-org/react';
import { CreditIcon } from '@/components/Utils/icons';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
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

type VideoInfosProps = {
  title: string;
  description: string;
  actant: string;
  date: string;
  url: string;
  fullUrl: string;
};

export const VideoInfos: React.FC<VideoInfosProps> = ({ title, description, actant, date, url, fullUrl }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>(url);
  const [buttonText, setButtonText] = useState<string>('séance complète');

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const handleButtonClick = () => {
    if (videoUrl === url) {
      setVideoUrl(fullUrl);
      setButtonText('conférence');
    } else {
      setVideoUrl(url);
      setButtonText('séance complète');
    }
  };

  return (
    <motion.div className='w-full flex flex-col gap-25' initial='hidden' animate='visible' variants={containerVariants}>
      <motion.div variants={itemVariants}></motion.div>
      <motion.div variants={itemVariants} className='rounded-14 lg:w-full overflow-hidden'>
        <iframe
          className='lg:w-[100%] lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] xs:h-[250px]'
          title='YouTube Video'
          width='100%'
          src={videoUrl}
          allowFullScreen></iframe>
      </motion.div>
      <motion.div variants={itemVariants} className='w-full flex flex-col gap-25'>
        <h1 className='font-semibold text-32'>{title}</h1>
        <div className='w-full flex flex-col gap-10'>
          <div className='w-full flex justify-between gap-10 items-center'>
            <div className='w-full flex justify-start gap-10 items-center'>
              <h3 className='text-default-400 font-regular text-24 gap-10 transition-all ease-in-out duration-200'>
                {actant}
              </h3>
              <Tooltip content='voir plus'>
                <Link className='cursor-pointer'>
                  <CreditIcon
                    size={20}
                    className='relative text-default-500 hover:text-default-action transition-all ease-in-out duration-200'
                  />
                </Link>
              </Tooltip>
            </div>
            {url !== fullUrl && fullUrl !== '' && (
              <Button
                size='md'
                className='h-[32px] text-16 p-10 rounded-8 text-default-500 hover:text-default-500 bg-default-200 hover:bg-default-300 transition-all ease-in-out duration-200'
                onClick={handleButtonClick}>
                {buttonText}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className='cursor-pointer flex flex-col bg-default-200 hover:bg-default-300 p-25 rounded-8 gap-10 transition-all ease-in-out duration-200'
        onClick={toggleExpansion}>
        <h3 className='text-16 text-default-500 font-semibold'>{date}</h3>
        <p
          className='text-16 text-default-500 font-normal transition-all ease-in-out duration-200 gap-10'
          style={{ lineHeight: '120%', maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
          {description}
        </p>
        <p className='text-16 text-default-action font-bold transition-all ease-in-out duration-200'>
          {expanded ? 'moins' : '...affichez plus'}
        </p>
      </motion.div>
    </motion.div>
  );
};
