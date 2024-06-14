import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import { usePrevNextButtons } from '../EmblaCarousel/EmblaCarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@nextui-org/react';
import { ArrowIcon, UserIcon } from '@/components/Utils/icons';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';

type CarouselVideoProp = {
  slides: number[];
  options?: EmblaOptionsType;
  titre: string;
  widthCard: number; // Add col prop type
  heightCard: number;
};

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.6,
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

export const CarouselVideo: React.FC<CarouselVideoProp> = (props) => {
  const { slides, options, titre, widthCard, heightCard } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className='embla flex flex-col gap-6'>
      <div className='flex flex-row place-content-between'>
        <h1 className='text-default-500 font-semibold font-regular text-24'>{titre}</h1>
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
      </div>
      <div className='embla__viewport' ref={emblaRef}>
        <motion.div className='embla__container' variants={containerVariants} initial='hidden' animate='visible'>
          {slides.map((index) => (
            <motion.div
              className={`flex flex-col gap-2.5 min-w-fit pl-8 embla__slide${widthCard}`}
              key={index}
              variants={slideVariants}>
              <div className={`embla__slide__number embla__slide__height${heightCard}`}>{index + 1}</div>
              <div className='font-semibold'>Introduction à la 3e édition du séminaire...</div>
              <div className='text-16 text-default-500'>Gaëtan Robillard</div>
              <div className='text-14 text-default-500'>2023-12-01</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const OPTIONS: EmblaOptionsType = { align: 'end' };
const SLIDE_COUNT = 50;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

type CarouselVideoHomeProps = {
  titre: string;
  widthCard: number; // Add col prop type
  heightCard: number;
};

export const CarouselVideoHome: React.FC<CarouselVideoHomeProps> = ({ titre, widthCard, heightCard }) => {
  return (
    <div className='w-full flex flex-col gap-6'>
      <CarouselVideo titre={titre} slides={SLIDES} options={OPTIONS} widthCard={widthCard} heightCard={heightCard} />
    </div>
  );
};

/* --------------------------------------------------------------------------------------------------------*/

type CarouselConferencierProp = {
  slides: number[];
  options?: EmblaOptionsType;
  titre: string;
  widthCard: number; // Add col prop type
  heightCard: number;
};

export const CarouselConferencier: React.FC<CarouselConferencierProp> = (props) => {
  const { slides, options, titre, widthCard, heightCard } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className='embla flex flex-col gap-6'>
      <div className='flex flex-row gap-50'>
        <div className='flex flex-col min-w-[450px] gap-25'>
          <h1 className='text-default-600 font-semibold font-regular text-24 '>{titre}</h1>
          <p className='text-16 text-default-500 text-justify leading-120'>
            Rencontrez les experts et visionnaires qui interviennent lors de nos conférences. Cliquez pour découvrir
            leur profil complet, incluant leur participation à divers séminaires, les thématiques qui leur sont chères,
            et bien plus encore.
          </p>
          <div className='flex'>
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
          </div>
        </div>
        <div className='embla__viewport' ref={emblaRef}>
          <motion.div className='embla__container' variants={containerVariants} initial='hidden' animate='visible'>
            {slides.map((index) => (
              <motion.div
                className={`flex flex-col gap-2.5 min-w-fit pl-8 embla__slide${widthCard}`}
                key={index}
                variants={slideVariants}>
                <Link
                  to={''}
                  className={`flex flex-col gap-25 items-center justify-center border-2 border-default-300 hover:border-default-action text-default-400 hover:text-default-action rounded-12 embla__slide__height${heightCard} transition-all ease-in-out duration-200`}>
                  <div>
                    <UserIcon size={40} />
                  </div>

                  <div className='flex flex-col items-center'>
                    <div className='text-16 leading-100 text-default-600 font-semibold'>Gabrielle Godin</div>
                    <div className='text-14 leading-100  text-default-500'>5 interventions</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

type CarouselConferencierHomeProps = {
  titre: string;
  widthCard: number; // Add col prop type
  heightCard: number;
};

export const CarouselConferencierHome: React.FC<CarouselConferencierHomeProps> = ({ titre, widthCard, heightCard }) => {
  return (
    <div className='w-full flex flex-col gap-6'>
      <CarouselConferencier
        titre={titre}
        slides={SLIDES}
        options={OPTIONS}
        widthCard={widthCard}
        heightCard={heightCard}
      />
    </div>
  );
};

/*
<div className='embla__dots'>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(index === selectedIndex ? ' embla__dot--selected' : '')}
            />
          ))}
        </div>
*/
