import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { motion } from 'framer-motion';
import { OeuvreIcon } from '@/components/ui/icons';


export const OeuvressBaner: React.FC = () => {

  return (
    <div className='pt-150 justify-center flex items-center flex-col gap-20'>
      {/* Main title with gradient highlight */}
      <div className='gap-20 justify-between flex items-center flex-col'>
        <OeuvreIcon size={40} className='text-c4'/>
        {/* Main title */}
        <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center transition-all ease-in-out duration-200'>
          Oeuvres Edisem
        </h1>

        <div className='flex flex-col gap-20 justify-center items-center'>
          {/* Subtitle */}
          <p className='text-c5 text-16 z-[12] text-center'>
            Plongez au cœur des collections intellectuelles d'EdiSem, une fenêtre ouverte sur <br/>
            la diversité des savoirs et des pratiques qui nourrissent nos événements.
          </p>


        </div>

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
          <div className='opacity-20 dark:opacity-30'>
            <BackgroundEllipse />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
