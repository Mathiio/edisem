import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { motion } from 'framer-motion';
import { ExperimentationIcon } from '@/components/ui/icons';



export const ExperimentationBaner = () => {
  // Count stats

  return (
    <div className='pt-100 justify-center flex items-center flex-col gap-20 relative'>
      <div className='gap-20 justify-between flex items-center flex-col'>
        <ExperimentationIcon size={40} className='text-c4'/>

        <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center'>
          Expérimentations Edisem
        </h1>

        <div className='flex flex-col gap-20 justify-center items-center'>
          <p className='text-c5 text-16 z-[12] text-center max-w-[600px]'>
            Plongez au cœur des collections intellectuelles d'EdiSem, une fenêtre ouverte sur
            la diversité des savoirs et des pratiques qui nourrissent nos événements.
          </p>

        </div>
        <AnimatedBackground />
      </div>
    </div>
  );
};


const AnimatedBackground = () => (
  <motion.div
    className='top-[-50px] absolute z-[-1]'
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, ease: 'easeIn' }}
  >
    <div className='opacity-20 dark:opacity-30'>
      <BackgroundEllipse />
    </div>
  </motion.div>
);
