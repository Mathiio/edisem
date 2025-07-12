import React from 'react';

export const BackgroundEllipse: React.FC = () => {
  return (
    <svg
      className='w-full h-full'
      xmlns='http://www.w3.org/2000/svg'
      width='1722'
      height='855'
      viewBox='0 0 1722 855'
      fill='none'
    >
      <g filter='url(#filter0_nf_3326_2067)'>
        <ellipse 
          cx='868' 
          cy='346' 
          rx='481' 
          ry='122' 
          className='fill-action' 
        />
      </g>
      <defs>
        <filter
          id='filter0_nf_3326_2067'
          x='0.5'
          y='-162.5'
          width='3000'
          height='2000'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
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
    </svg>
  );
};