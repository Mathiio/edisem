import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { motion } from 'framer-motion';
import { OeuvreIcon } from '@/components/ui/icons';

interface OeuvresBanerProps {
  oeuvres: any[];
}

export const OeuvresBaner: React.FC<OeuvresBanerProps> = ({ oeuvres }) => {
  return (
    <div className='pt-100 justify-center flex items-center flex-col gap-20'>
      {/* Main title with gradient highlight */}
      <div className='gap-20 justify-between flex items-center flex-col'>
        <OeuvreIcon size={40} className='text-c4' />
        {/* Main title */}
        <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center transition-all ease-in-out duration-200'>Œuvres Edisem</h1>

        <div className='flex flex-col gap-20 justify-center items-center'>
          {/* Subtitle */}
          <p className='text-c5 text-16 z-[12] text-center'>
            Découvrez les œuvres scientifiques et intellectuelles qui constituent le patrimoine éditorial
            <br />
            d'EdiSem, reflétant la richesse de nos recherches et collaborations académiques.
          </p>

          {/* Statistics section */}
          <div className='flex gap-20 z-[12]'>
            {/* Total oeuvres */}
            <div className='flex border-3 border-c3 rounded-8 p-10'>
              <p className='text-14 text-c5'>{oeuvres.length} œuvres</p>
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
          }}>
          <div className='opacity-20 dark:opacity-30'>
            <BackgroundEllipse />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
