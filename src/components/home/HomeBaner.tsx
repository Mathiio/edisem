import { motion } from 'framer-motion';



export const HomeBaner: React.FC = () => {
  return (
    <div className='pt-150 justify-center flex items-center flex-col gap-[30px]'>
      <div className='gap-[30px] justify-between flex items-center flex-col'>
        <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center transition-all ease-in-out duration-200 '>
          <span>Edisem, aux frontières</span>
          <span className='bg-gradient-to-b from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-top font-[500]'>
            de la machine et de l’imaginaire
          </span>
        </h1>
        <p className='text-c5 text-16 z-[12]'>Explorer les récits, la créativité et l’auctorialité à l’ère des IA génératives.</p>

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

    </div>
  );
};
