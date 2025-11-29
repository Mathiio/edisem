import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OeuvreCardProps {
  id: string;
  title: string;
  thumbnail: string;
  actant: string;
  date: string;
  universite: string;
}

export const LongCard: React.FC<OeuvreCardProps> = ({ id, title, thumbnail, actant, date, universite }) => {
  const navigate = useNavigate();

  const openOeuvre = () => {
    navigate(`/corpus/oeuvre/${id}`);
  };

  return (
    <motion.div
      onClick={openOeuvre}
      className='hover:shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] w-full h-full border-t-c3 hover:border-c3 border-c1 border-2 cursor-pointer p-20 rounded-30 flex gap-20 hover:bg-c2 transition-all duration-200'>
      {thumbnail && <img src={thumbnail} alt={title} className='w-auto h-[80px] rounded-8' />}

      <div className='flex flex-col gap-10'>
        <h3 className='text-16 text-c6 font-medium line-clamp-2'>{title}</h3>

        {actant && (
          <div className='flex items-center gap-8'>
            <p className='text-14 text-c5'>{actant}</p>
          </div>
        )}

        <div className='flex justify-between items-center'>
          {date && <p className='text-12 text-c4'>{date}</p>}
          {universite && <p className='text-12 text-c4'>{universite}</p>}
        </div>
      </div>
    </motion.div>
  );
};

interface SearchModalProps {
  id: string;
  title: string;
  date?: string;
  thumbnail?: string;
  acteurs?: Array<{
    id: string;
    name: string;
    thumbnail?: string;
    page?: string;
  }>;
  onClose: () => void;
}

export const SearchModalCard: React.FC<SearchModalProps> = ({ id, title, date, thumbnail, acteurs = [], onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openOeuvre = () => {
    navigate(`/corpus/oeuvre/${id}`);
    onClose();
  };

  const getActeursText = () => {
    if (!acteurs || acteurs.length === 0) return '';
    const validActeurs = acteurs.filter((acteur) => acteur?.name && typeof acteur.name === 'string');

    if (validActeurs.length === 0) return '';

    const displayActeurs = validActeurs.slice(0, 2).map((acteur) => acteur.name.trim());
    let result = displayActeurs.join(', ');

    if (validActeurs.length > 2) {
      result += ` et ${validActeurs.length - 2} autre${validActeurs.length - 2 > 1 ? 's' : ''}`;
    }

    return result;
  };

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [title]);

  return (
    <div
      onClick={openOeuvre}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer border-2 h-full rounded-12 flex items-center justify-start p-20 gap-20 transition-transform-colors-opacity ${
        isHovered ? 'border-c4' : 'border-c3'
      }`}>
      {/* Image ou placeholder */}
      <div
        className={`p-50 h-full w-300 rounded-12 justify-center items-center flex ${thumbnail ? 'bg-cover bg-center' : 'bg-gradient-to-br from-200 to-400'}`}
        style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnail ? 'invisible' : ''}`}>ŒUVRE</h3>
      </div>

      {/* Contenu */}
      <div className='flex flex-col gap-5 w-full'>
        {/* Titre */}
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-c6'></span>}
        </div>

        {/* Acteurs */}
        {getActeursText() && <p className='text-16 text-c5 font-extralight'>{getActeursText()}</p>}

        {/* Date */}
        {date && <p className='text-14 text-c5 font-extralight'>{date}</p>}
      </div>
    </div>
  );
};

interface OeuvreProps {
  id: string;
  title: string;
  date?: string;
  thumbnail?: string;
  acteurs?: Array<{
    id: string;
    name: string;
    thumbnail?: string;
    page?: string;
  }>;
}

export const OeuvreCard: React.FC<OeuvreProps> = ({ id, title, date, thumbnail, acteurs = [] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const openOeuvre = () => {
    navigate(`/corpus/oeuvre/${id}`);
  };

  const getActeursText = () => {
    if (!acteurs || acteurs.length === 0) return '';
    const validActeurs = acteurs.filter((acteur) => acteur?.name && typeof acteur.name === 'string');

    if (validActeurs.length === 0) return '';

    const displayActeurs = validActeurs.slice(0, 2).map((acteur) => acteur.name.trim());
    let result = displayActeurs.join(', ');

    if (validActeurs.length > 2) {
      result += ` et ${validActeurs.length - 2} autre${validActeurs.length - 2 > 1 ? 's' : ''}`;
    }

    return result;
  };

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [title]);

  return (
    <div
      onClick={openOeuvre}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer border-2 h-full rounded-12 flex items-center justify-start p-20 gap-20 transition-transform-colors-opacity ${
        isHovered ? 'border-c4' : 'border-c3'
      }`}>
      {/* Image ou placeholder */}
      <div
        className={`p-50 h-full w-300 rounded-12 justify-center items-center flex ${thumbnail ? 'bg-cover bg-center' : 'bg-gradient-to-br from-200 to-400'}`}
        style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : {}}>
        <h3 className={`text-16 text-100 font-semibold text-selected ${thumbnail ? 'invisible' : ''}`}>ŒUVRE</h3>
      </div>

      {/* Contenu */}
      <div className='flex flex-col gap-5 w-full'>
        {/* Titre */}
        <div className='relative'>
          <p ref={textRef} className='text-16 text-c6 font-medium overflow-hidden max-h-[4.5rem] line-clamp-3'>
            {title}
          </p>
          {isTruncated && <span className='absolute bottom-0 right-0 bg-white text-c6'></span>}
        </div>

        {/* Acteurs */}
        {getActeursText() && <p className='text-16 text-c5 font-extralight'>{getActeursText()}</p>}

        {/* Date */}
        {date && <p className='text-14 text-c5 font-extralight'>{date}</p>}
      </div>
    </div>
  );
};
