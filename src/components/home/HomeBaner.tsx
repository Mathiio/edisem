import { MagicIcon } from '@/components/utils/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const HomeBaner: React.FC = () => {
  return (
    <div className='py-[70px] justify-center flex items-center flex-col gap-[30px]'>
      <div className='gap-[30px] justify-between flex items-center flex-col'>
        <h1 className='z-[12] text-64 font-medium flex flex-col items-center transition-all ease-in-out duration-200 '>
          <span className='text-c6 font-[600]'>Edisem, plongez dans</span>
          <span className='bg-gradient-to-r from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-left font-[600]'>
            une nouvelle ère de recherche
          </span>
        </h1>
        <p className='text-c4 text-16 z-[12]'>Explorer, Connecter, Découvrir et plus.</p>

        <motion.svg
          className='top-[-80px] absolute hidden dark:block z-[-1]'
          xmlns='http://www.w3.org/2000/svg'
          width='1722'
          height='855'
          viewBox='0 0 1722 855'
          fill='none'
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,

            ease: 'easeIn',
          }}>
          <g filter='url(#filter0_nf_3326_2067)'>
            <ellipse cx='868' cy='346' rx='481' ry='122' fill='#8000FF' fillOpacity='0.2' />
          </g>
          <defs>
            <filter
              id='filter0_nf_3326_2067'
              x='0.5'
              y='-162.5'
              width='3000'
              height='2000'
              filterUnits='userSpaceOnUse'
              colorInterpolationFilters='sRGB'>
              <feFlood floodOpacity='0' result='BackgroundImageFix' />
              <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
              <feTurbulence
                type='fractalNoise'
                baseFrequency='0.1 0.1'
                stitchTiles='stitch'
                numOctaves='10'
                result='noise'
                seed='7000'
              />
              <feComponentTransfer in='noise' result='coloredNoise1'>
                <feFuncR type='linear' slope='7' intercept='-0.5' />
                <feFuncG type='linear' slope='7' intercept='-0.5' />
                <feFuncB type='linear' slope='7' intercept='-0.5' />
                <feFuncA
                  type='discrete'
                  tableValues='1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 '
                />
              </feComponentTransfer>
              <feComposite operator='in' in2='shape' in='coloredNoise1' result='noise1Clipped' />
              <feComponentTransfer in='noise1Clipped' result='color1'>
                <feFuncA type='table' tableValues='0 0.25' />
              </feComponentTransfer>
              <feMerge result='effect1_noise_3326_2067'>
                <feMergeNode in='shape' />
                <feMergeNode in='color1' />
              </feMerge>
              <feGaussianBlur stdDeviation='193.25' result='effect2_foregroundBlur_3326_2067' />
            </filter>
          </defs>
        </motion.svg>
      </div>

      <Link
        to='/visualisation'
        className='bg-transparent z-[12] py-3 px-6 flex border-3 border-c3 rounded-12 hover:border-c4 transition-all ease-in-out duration-200 items-center gap-10'>
        <span className='text-16 text-c6'>Recherche par datavisualisation...</span>
        <MagicIcon size={16} className='text-c4' />
      </Link>

      <div className=''></div>
    </div>
  );
};
