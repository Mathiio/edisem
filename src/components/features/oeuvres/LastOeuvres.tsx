import React from 'react';
import { motion, Variants } from 'framer-motion';
import { OeuvreCard } from '@/components/features/oeuvres/OeuvresCards';
import { Pagination } from '@heroui/react';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

interface LastOeuvresProps {
  recitsArtistiques: any[];
  loading: boolean;
  itemsPerPage?: number;
  initialPage?: number;
  showControls?: boolean;
}

export const LastOeuvres: React.FC<LastOeuvresProps> = ({ recitsArtistiques, loading, itemsPerPage = 4, initialPage = 1, showControls = true }) => {
  const [activePage, setActivePage] = React.useState(initialPage);

  // Calculate paginated data
  const paginatedOeuvres = React.useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return recitsArtistiques.slice(start, start + itemsPerPage);
  }, [recitsArtistiques, activePage, itemsPerPage]);

  // Total number of pages
  const totalPages = Math.ceil(recitsArtistiques.length / itemsPerPage);

  // Handle page change (with animation reset)
  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  return (
    <div className='flex flex-col w-full gap-20'>
      {/* Main content */}
      <div className='w-full flex justify-between items-center'>
        <h2 className='text-24 font-medium text-c6'>Toutes nos Récits Artistiques/Oeuvres</h2>
        {!loading && recitsArtistiques.length > itemsPerPage && (
          <div className='flex justify-center mt-30'>
            <Pagination
              total={totalPages}
              initialPage={initialPage}
              page={activePage}
              onChange={handlePageChange}
              showControls={showControls}
              color='primary'
              variant='flat'
              classNames={{
                wrapper: 'gap-2',
                item: 'bg-c3 rounded-12 text-c6',
                cursor: 'bg-gradient-to-br from-action to-action2 text-c6 rounded-12',
                prev: 'bg-c3 rounded-12',
                next: 'bg-c3 rounded-12',
              }}
            />
          </div>
        )}
      </div>
      <div className='grid grid-cols-4 grid-rows-auto gap-20'>
        {loading
          ? // Skeleton loading (adapted to the number of items per page)
          Array.from({ length: Math.min(itemsPerPage, 8) }).map((_, index) => (
            <div key={`skeleton-${index}`} className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] h-[280px] border-c3 border-2 p-20 rounded-30 animate-pulse'>
              <div className='w-full h-40 rounded-15 bg-c2 mb-15'></div>
              <div className='h-6 w-3/4 bg-c2 rounded mb-10'></div>
              <div className='h-4 w-1/2 bg-c2 rounded'></div>
            </div>
          ))
          : // Cards with animations
          paginatedOeuvres.map((oeuvre: any, index: number) => (
            <motion.div key={`${oeuvre.id}-${activePage}`} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
              <OeuvreCard {...oeuvre} />
            </motion.div>
          ))}
      </div>
    </div>
  );
};
