import { Layouts } from "@/components/layout/Layouts";
import { motion } from 'framer-motion';
import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';



export const PratiqueNarrative: React.FC = () => {


  return (
       <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
          <div className='pt-100 justify-center flex items-center flex-col gap-20 relative'>
               <div className='gap-20 justify-between flex items-center flex-col'>
               <LoadingAnimation />

               <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center'>
                    IA et pratiques narratives
               </h1>

               <div className='flex flex-col gap-20 justify-center items-center'>
                    <p className='text-c5 text-16 z-[12] text-center max-w-[600px]'>
                         Cette page est actuellement en cours de développement.<br/>
                         Les contenus seront prochainement mis en ligne.
                    </p>
               </div>

               <AnimatedBackground />
               </div>
          </div>
       </Layouts>
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

const LoadingAnimation = () => (
  <div className="flex gap-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-3 h-3 rounded-full bg-c6"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 0.2,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);