import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import { DotButton, useDotButton } from './EmblaCarouselDotButton';
import { usePrevNextButtons } from './EmblaCarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@nextui-org/react';
import { ArrowIcon } from '@/components/Utils/icons';
import { motion, Variants } from 'framer-motion';

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
};

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger each child animation by 0.3 seconds
      delayChildren: 0.6, // Start after a delay of 0.2 seconds
    },
  },
};

const slideVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
};

export const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className='embla'>
      <div className='embla__viewport' ref={emblaRef}>
        <motion.div className='embla__container' variants={containerVariants} initial='hidden' animate='visible'>
          {slides.map((index) => (
            <motion.div className='embla__slide' key={index} variants={slideVariants}>
              <div className='embla__slide__number'>{index + 1}</div>
              <div className='font-semibold'>Introduction à la 3e édition du séminaire...</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className='embla__controls'>
        <div className='embla__buttons'>
          <Button
            size='sm'
            className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action'
            onClick={onPrevButtonClick}
            isDisabled={prevBtnDisabled}>
            <ArrowIcon size={20} transform='rotate(180deg)' />
          </Button>
          <Button
            size='sm'
            className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action'
            onClick={onNextButtonClick}
            isDisabled={nextBtnDisabled}>
            <ArrowIcon size={20} />
          </Button>
        </div>

        <div className='embla__dots'>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(index === selectedIndex ? ' embla__dot--selected' : '')}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
