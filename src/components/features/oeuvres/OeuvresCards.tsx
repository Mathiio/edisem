import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface OeuvreCardProps {
  id: string;
  title: string;
  thumbnail: string;
  actant: string;
  date: string;
  universite: string;
}

export const LongCard: React.FC<OeuvreCardProps> = ({
  id,
  title,
  thumbnail,
  actant,
  date,
  universite
}) => {
  const navigate = useNavigate();

  const openOeuvre = () => {
    navigate(`/oeuvre/${id}`);
  };

  return (
    <motion.div
      onClick={openOeuvre}
      className='hover:shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] w-full h-full border-c3 border-2 cursor-pointer p-20 rounded-30 flex gap-20 hover:bg-c2 transition-all duration-200'
    >
      {thumbnail && (
        <img
        src={thumbnail}
        alt={title}
        className='w-auto h-[80px] rounded-8'
        />
      )}

      <div className='flex flex-col gap-10'>
        <h3 className='text-16 text-c6 font-medium line-clamp-2'>{title}</h3>

        {actant && (
          <div className='flex items-center gap-8'>
            <p className='text-14 text-c5'>{actant}</p>
          </div>
        )}

        <div className='flex justify-between items-center'>
          {date && <p className='text-12 text-c4'>{new Date(date).toLocaleDateString()}</p>}
          {universite && <p className='text-12 text-c4'>{universite}</p>}
        </div>
      </div>
    </motion.div>
  );
};
