import { Button } from '@nextui-org/react';
import { ArrowIcon } from '@/components/utils/icons';
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

type FullCarrouselProps = {
  data: any[];
  title: string;
  perPage: number;
  perMove: number;
  renderSlide: (item: any, index: number) => React.ReactNode;
};

export const FullCarrousel: React.FC<FullCarrouselProps> = ({ data, title, perPage, perMove, renderSlide }) => {
  return (
    <Splide
      options={{ perPage: perPage, gap: '1rem', pagination: false, perMove: perMove, speed: 1000 }}
      hasTrack={false}
      aria-label='...'
      className='flex flex-col w-full justify-center gap-25'>
      <div className='w-full flex justify-between items-center'>
        <h2 className='text-24 font-bold text-default-600'>{title}</h2>
        <div className='splide__arrows relative flex gap-10'>
          <Button
            size='sm'
            className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action splide__arrow transform translate-y-0 splide__arrow--prev relative left-0 focus:outline-none'>
            <ArrowIcon size={20} transform='rotate(180deg)' />
          </Button>
          <Button
            size='sm'
            className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action splide__arrow transform translate-y-0 splide__arrow--next relative right-0 focus:outline-none'>
            <ArrowIcon size={20} />
          </Button>
        </div>
      </div>
      <SplideTrack className='w-full'>
        {data.map((item, index) => (
          <SplideSlide key={index}>{renderSlide(item, index)}</SplideSlide>
        ))}
      </SplideTrack>
    </Splide>
  );
};

type MidCarrouselProps = {
  data: any[];
  title: string;
  description: string;
  perPage: number;
  perMove: number;
  renderSlide: (item: any, index: number) => React.ReactNode;
};

export const MidCarrousel: React.FC<MidCarrouselProps> = ({
  data,
  title,
  description,
  perPage,
  perMove,
  renderSlide,
}) => {
  return (
    <Splide
      options={{ perPage: perPage, gap: '1rem', pagination: false, perMove: perMove, speed: 1000 }}
      hasTrack={false}
      aria-label='...'
      className='flex w-full items-center justify-center gap-20'>
      <div className='w-[40%] flex flex-col justify-center gap-10 items-start'>
        <h2 className='text-24 font-bold text-default-600'>{title}</h2>
        <p className='text-16 font-regular text-default-500'>{description}</p>
        <div className='splide__arrows relative flex gap-10'>
          <Button
            size='sm'
            className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action splide__arrow transform translate-y-0 splide__arrow--prev relative left-0 focus:outline-none'>
            <ArrowIcon size={20} transform='rotate(180deg)' />
          </Button>
          <Button
            size='sm'
            className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action splide__arrow transform translate-y-0 splide__arrow--next relative right-0 focus:outline-none'>
            <ArrowIcon size={20} />
          </Button>
        </div>
      </div>
      <SplideTrack className='w-full h-max'>
        {data.map((item, index) => (
          <SplideSlide key={index}>{renderSlide(item, index)}</SplideSlide>
        ))}
      </SplideTrack>
    </Splide>
  );
};

type LongCarrouselProps = {
  data: any[];
  perPage: number;
  perMove: number;
  autowidth: boolean;
  renderSlide: (item: any, index: number) => React.ReactNode;
};

export const LongCarrousel: React.FC<LongCarrouselProps> = ({ data, autowidth, perPage, perMove, renderSlide }) => {
  return (
    <Splide
      options={{
        perPage: perPage,
        gap: '1rem',
        pagination: false,
        perMove: perMove,
        speed: 1000,
        autoWidth: autowidth,
      }}
      hasTrack={false}
      aria-label='...'
      className='flex w-full justify-between items-center gap-25'>
      <SplideTrack className='w-full'>
        {data.map((item, index) => (
          <SplideSlide key={index}>{renderSlide(item, index)}</SplideSlide>
        ))}
      </SplideTrack>
      <div className=' flex justify-between items-center'>
        <div className='splide__arrows relative flex gap-10'>
          <Button
            size='sm'
            className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action splide__arrow transform translate-y-0 splide__arrow--prev relative left-0 focus:outline-none'>
            <ArrowIcon size={20} transform='rotate(180deg)' />
          </Button>
          <Button
            size='sm'
            className='p-0 min-w-[32px] min-h-[32px] text-default-selected bg-default-action splide__arrow transform translate-y-0 splide__arrow--next relative right-0 focus:outline-none'>
            <ArrowIcon size={20} />
          </Button>
        </div>
      </div>
    </Splide>
  );
};

export const LongCarrouselFilter: React.FC<LongCarrouselProps> = ({
  data,
  autowidth,
  perPage,
  perMove,
  renderSlide,
}) => {
  return (
    <Splide
      options={{
        perPage: perPage,
        gap: '10px',
        pagination: false,
        perMove: perMove,
        speed: 1000,
        autoWidth: autowidth,
      }}
      hasTrack={false}
      aria-label='...'
      className='flex w-full justify-between items-center gap-10'>
      <div className=' flex justify-between items-center'>
        <div className='splide__arrows relative flex gap-10'>
          <Button
            size='sm'
            className='p-0 min-w-[25px] min-h-[25px] text-default-selected bg-default-action splide__arrow transform translate-y-0 splide__arrow--prev relative left-0 focus:outline-none'>
            <ArrowIcon size={20} transform='rotate(180deg)' />
          </Button>
        </div>
      </div>
      <SplideTrack className='w-full'>
        {data.map((item, index) => (
          <SplideSlide key={index}>{renderSlide(item, index)}</SplideSlide>
        ))}
      </SplideTrack>
      <div className=' flex justify-between items-center'>
        <div className='splide__arrows relative flex gap-10'>
          <Button
            size='sm'
            className='p-0 min-w-[25px] min-h-[25px] text-default-selected bg-default-action splide__arrow transform translate-y-0 splide__arrow--next relative right-0 focus:outline-none'>
            <ArrowIcon size={20} />
          </Button>
        </div>
      </div>
    </Splide>
  );
};
