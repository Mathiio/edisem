import { motion, Variants } from 'framer-motion';
import { LongCard } from './OeuvresCards';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

interface LastOeuvresProps {
  oeuvres: any[];
  loading: boolean;
}

export const LastOeuvres: React.FC<LastOeuvresProps> = ({ oeuvres, loading }) => {
  return (
    <div className='flex flex-col w-full'>
      {loading
        ? Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] h-[280px] border-c3 border-2 p-20 rounded-30 animate-pulse'>
              <div className='w-full h-40 rounded-15 bg-c2 mb-15'></div>
              <div className='h-6 w-3/4 bg-c2 rounded mb-10'></div>
              <div className='h-4 w-1/2 bg-c2 rounded'></div>
            </div>
          ))
        : oeuvres.map((item: any, index: number) => (
            <motion.div
              key={item.id}
              initial='hidden'
              animate='visible'
              variants={fadeIn}
              custom={index}
            >
              <LongCard
                id={item.id}
                title={item.title}
                thumbnail={item.thumbnail}
                actant={item.primaryActant
                  ? item.primaryActant.displayName
                    || `${item.primaryActant.firstname} ${item.primaryActant.lastname}`
                  : ''}
                date={item.date}
                universite={item.primaryActant?.universities?.[0]?.name || ''}
              />
            </motion.div>
          ))}
    </div>
  );
};
