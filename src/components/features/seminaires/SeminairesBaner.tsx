import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { motion } from 'framer-motion';
import { SeminaireIcon } from '@/components/ui/icons';
import { Edition } from '@/types/ui';

interface SeminairesBanerProps {
  editions: Edition[];
}

export const SeminairesBaner = ({ editions }: SeminairesBanerProps) => {
  const totalEditions = editions.length;
  const totalConferences = editions.reduce((acc, ed) => acc + (ed.conferences?.length || 0), 0);

  return (
    <div className='pt-100 justify-center flex items-center flex-col gap-20 relative'>
      <div className='gap-20 justify-between flex items-center flex-col'>
        <SeminaireIcon size={40} className='text-c4' />

        <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center'>
          Séminaires Edisem
        </h1>

        <div className='flex flex-col gap-20 justify-center items-center'>
          <p className='text-c5 text-16 z-[12] text-center max-w-[600px]'>
            Plongez au cœur des collections intellectuelles d'EdiSem, une fenêtre ouverte sur
            la diversité des savoirs et des pratiques qui nourrissent nos événements.
          </p>

          <div className='flex gap-20 z-[12]'>
            <StatCard label="éditions" value={totalEditions} />
            <StatCard label="conférences" value={totalConferences} />
          </div>
        </div>

        <AnimatedBackground />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className='flex border-3 border-c3 rounded-8 p-10'>
    <p className='text-14 text-c5'>{value} {label}</p>
  </div>
);

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