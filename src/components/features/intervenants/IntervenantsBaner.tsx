import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { motion } from 'framer-motion';



export const IntervenantsBaner: React.FC = () => {
  return (
    <div className='pt-150 justify-center flex items-center flex-col gap-[30px]'>
        {/* Central container with title and subtitle */}
        <div className='gap-[30px] justify-between flex items-center flex-col'>
            {/* Main title */}
            <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center transition-all ease-in-out duration-200 '>
                <span>Découvrez les voix</span>
                <span className='bg-gradient-to-t from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-top font-[500]'>
                    qui façonnent Edisem
                </span>
            </h1>
            {/* Subtitle */}
            <p className='text-c5 text-16 z-[12] text-center'>
                Retrouvez ici les chercheur·euses, artistes, doctorant·es et penseur·euses qui <br/> 
                façonnent la réflexion autour des arts, du design, des humanités numériques et de l’intelligence artificielle.
            </p>
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
                <div className='opacity-20 dark:opacity-30'>
                    <BackgroundEllipse />
                </div>
            </motion.div>
        </div>
    </div>
  );
};
