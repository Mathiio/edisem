import React from 'react';
import { motion, Variants } from 'framer-motion';
import { LongCard } from './OeuvresCards';
import { Pagination } from '@heroui/pagination';


const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

interface LastOeuvresProps {
  oeuvres: any[];
  loading: boolean;
  itemsPerPage?: number;
  initialPage?: number;
  showControls?: boolean;
}


export const LastOeuvres: React.FC<LastOeuvresProps> = ({
  oeuvres,
  loading,
  itemsPerPage = 5,
  initialPage = 1,
  showControls = true
}) => {
  const [activePage, setActivePage] = React.useState(initialPage);

  // Calculate paginated data
  const paginatedOeuvres = React.useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return oeuvres.slice(start, start + itemsPerPage);
  }, [oeuvres, activePage, itemsPerPage]);

  // Total number of pages
  const totalPages = Math.ceil(oeuvres.length / itemsPerPage);

  // Handle page change (with animation reset)
  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  return (
    <div className='flex flex-col w-full gap-20'>
      {/* Contenu principal */}
      <div className='w-full flex justify-between items-center'>
        <h2 className='text-24 font-medium text-c6'>Toutes nos oeuvres</h2>
        {!loading && oeuvres.length > itemsPerPage && (
                <div className='flex justify-center mt-30'>
                <Pagination
                    total={totalPages}
                    initialPage={initialPage}
                    page={activePage}
                    onChange={handlePageChange}
                    showControls={showControls}
                    color="primary"
                    variant="flat"
                    classNames={{
                    wrapper: "gap-2",
                    item: "bg-c3 rounded-12 text-c6",
                    cursor: "bg-gradient-to-br from-action to-action2 text-c6 rounded-12",
                    prev: "bg-c3 rounded-12",
                    next: "bg-c3 rounded-12"
                    }}
                />
                </div>
            )}
        </div>
      <div className='flex flex-col'>
        {loading ? (
          // Skeleton loading (adapté au nombre d'items par page)
          Array.from({ length: Math.min(itemsPerPage, 8) }).map((_, index) => (
            <div key={`skeleton-${index}`} className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] h-[280px] border-c3 border-2 p-20 rounded-30 animate-pulse'>
              <div className='w-full h-40 rounded-15 bg-c2 mb-15'></div>
              <div className='h-6 w-3/4 bg-c2 rounded mb-10'></div>
              <div className='h-4 w-1/2 bg-c2 rounded'></div>
            </div>
          ))
        ) : (
          // Cards with animations
          paginatedOeuvres.map((item: any, index: number) => (
            <motion.div
              key={`${item.id}-${activePage}`}
              initial='hidden'
              animate='visible'
              variants={fadeIn}
              custom={index}
            >
              <LongCard
                id={item.id}
                title={item.title}
                thumbnail={item.thumbnail}
                actant={item.primaryActant
                  ? item.primaryActant.displayName
                    || `${item.primaryActant.firstname} ${item.primaryActant.lastname}`
                  : ''}
                date={item.date}
                universite={item.primaryActant?.universities?.[0]?.name || ''}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
