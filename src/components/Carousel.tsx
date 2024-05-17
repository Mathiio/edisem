import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import { EmblaCarousel } from '@/components/EmblaCarousel';

const OPTIONS: EmblaOptionsType = { align: 'end' };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export const Carousel = () => {
  return (
    <div className='w-full flex flex-col gap-sm'>
      <div className='text-default-600 font-normal text-md'>Autres sessions</div>
      <EmblaCarousel slides={SLIDES} options={OPTIONS} />
    </div>
  );
};
