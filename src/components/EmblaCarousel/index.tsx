import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import { DotButton, useDotButton } from './EmblaCarouselDotButton';
import { usePrevNextButtons } from './EmblaCarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@nextui-org/react';
import { ArrowIcon } from '@/components/Utils/icons';

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
};

export const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className='embla'>
      <div className='embla__viewport' ref={emblaRef}>
        <div className='embla__container'>
          {slides.map((index) => (
            <div className='embla__slide' key={index}>
              <div className='embla__slide__number'>{index + 1}</div>
              <div className='font-semibold'>Introduction à la 3e édition du séminaire...</div>
            </div>
          ))}
        </div>
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
