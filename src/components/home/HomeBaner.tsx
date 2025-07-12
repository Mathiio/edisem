import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { motion } from 'framer-motion';



export const HomeBaner: React.FC = () => {
  return (
    <div className='pt-150 justify-center flex items-center flex-col gap-[30px]'>
      {/* Main title with gradient highlight */}
      <div className='gap-[30px] justify-between flex items-center flex-col'>
        {/* Main title */}
        <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center transition-all ease-in-out duration-200 '>
          <span>Edisem, aux frontières</span>
          <span className='bg-gradient-to-t from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-top font-[500]'>
            de la machine et de l’imaginaire
          </span>
        </h1>

        {/* Subtitle */}
        <p className='text-c5 text-16 z-[12]'>Explorer les récits, la créativité et l’auctorialité à l’ère des IA génératives.</p>

        {/* Animated SVG background shape */}
        <motion.div
          className='top-[-50px] absolute z-[-1]'
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: 'easeIn',
          }}
        >

          {/* Light/dark mode opacity variation for the background SVG */}
          <div className='opacity-20 dark:opacity-40'>
            <BackgroundEllipse />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
