import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import * as Items from "@/lib/Items";
import { SeminaireIcon } from '@/components/ui/icons';

export const SeminairesBaner: React.FC = () => {
  const [stats, setStats] = useState({
    totalConferences: 0,
    totalEditions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const seminaires = await Items.getSeminaires();

        // Calculate total conferences
        console.log(seminaires)
        const totalConferences = seminaires.reduce((sum: number, seminar: any) =>
          sum + (seminar.confNum || 0), 0);

        // Count unique editions
        const uniqueEditions = new Set(seminaires.map((s: any) => s.id)).size;


        setStats({
          totalConferences,
          totalEditions: uniqueEditions,
        });
      } catch (error) {
        console.error('Error fetching seminar stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className='pt-150 justify-center flex items-center flex-col gap-20'>
      {/* Main title with gradient highlight */}
      <div className='gap-20 justify-between flex items-center flex-col'>
        <SeminaireIcon size={40} className='text-c4'/>
        {/* Main title */}
        <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center transition-all ease-in-out duration-200'>
          Séminaires Edisem
        </h1>

        <div className='flex flex-col gap-20 justify-center items-center'>
          {/* Subtitle */}
          <p className='text-c5 text-16 z-[12] text-center'>
            Plongez au cœur des collections intellectuelles d'EdiSem, une fenêtre ouverte sur <br/>
            la diversité des savoirs et des pratiques qui nourrissent nos événements.
          </p>

          {/* Statistics section */}
          <div className='flex gap-20 z-[12]'>
            {/* Total conferences */}
            <div className='flex border-3 border-c3 rounded-8 p-10'>
              <p className='text-14 text-c5'>{stats.totalEditions} éditions</p>
            </div>

            {/* Total editions */}
            <div className='flex border-3 border-c3 rounded-8 p-10'>
              <p className='text-14 text-c5'>{stats.totalConferences} conférences</p>
            </div>
          </div>
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
