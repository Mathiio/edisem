import React from 'react';
import { motion } from 'framer-motion';
import { SearchResultSection } from './SearchResultSection';
import { IntervenantLongCard, IntervenantLongCardSkeleton } from '@/components/features/intervenants/IntervenantCards';
import { ConfCard, ConfSkeleton } from '@/components/layout/ConfCard';
import { SearchModalCard } from '@/components/features/oeuvres/OeuvresCards';
import { SearchFilters } from '@/services/search.ts';

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4, 
      delay: index * 0.08, 
      ease: "easeOut"
    },
  }),
};

interface SearchResultsProps {
  results: SearchFilters;
  loading: {
    actants: boolean;
    conferences: boolean; 
    oeuvres: boolean;
  };
  hasSearched: boolean;
  totalResults: number;
  onClose: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  hasSearched,
  totalResults,
  onClose
}) => {
  if (!hasSearched) return null;

  let globalIndex = 0;

  const getNextIndex = () => globalIndex++;

  return (
    <div className="w-full py-20">
      <div className="w-full flex flex-col gap-50">
        
        {/* 🎯 Conférences de séminaires */}
        <SearchResultSection
          title="Conférences de séminaires"
          count={results.conferences.seminars.length}
          loading={loading.conferences}
          SkeletonComponent={ConfSkeleton}
        >
          {results.conferences.seminars.map((conference) => (
            <motion.div
              key={conference.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              custom={getNextIndex()}
              onClick={onClose}
            >
              <ConfCard {...conference} />
            </motion.div>
          ))}
        </SearchResultSection>

        <SearchResultSection
          title="Conférences de journées d'études"
          count={results.conferences.studyDays.length}
          loading={loading.conferences}
          SkeletonComponent={ConfSkeleton}
        >
          {results.conferences.studyDays.map((conference) => (
            <motion.div
              key={conference.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              custom={getNextIndex()}
              onClick={onClose}
            >
              <ConfCard {...conference} />
            </motion.div>
          ))}
        </SearchResultSection>

        <SearchResultSection
          title="Conférences de colloques"
          count={results.conferences.colloques.length}
          loading={loading.conferences}
          SkeletonComponent={ConfSkeleton}
        >
          {results.conferences.colloques.map((conference) => (
            <motion.div
              key={conference.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              custom={getNextIndex()}
              onClick={onClose}
            >
              <ConfCard {...conference} />
            </motion.div>
          ))}
        </SearchResultSection>

        <SearchResultSection
          title="Œuvres"
          count={results.oeuvres.length}
          loading={loading.oeuvres}
        >
          {results.oeuvres.map((oeuvre) => (
            <motion.div
              key={oeuvre.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              custom={getNextIndex()}
            >
              <SearchModalCard
                id={oeuvre.id}
                title={oeuvre.title}
                date={oeuvre.date}
                thumbnail={oeuvre.thumbnail}
                acteurs={oeuvre.acteurs}
                onClose={onClose}
              />
            </motion.div>
          ))}
        </SearchResultSection>

        <SearchResultSection
          title={`Intervenant${results.actants.length > 1 ? 's' : ''}`}
          count={results.actants.length}
          loading={loading.actants}
          SkeletonComponent={IntervenantLongCardSkeleton}
        >
          {results.actants.map((actant) => (
            <motion.div
              key={actant.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              custom={getNextIndex()}
              onClick={onClose}
            >
              <IntervenantLongCard {...actant} />
            </motion.div>
          ))}
        </SearchResultSection>

        {hasSearched && 
         totalResults === 0 && 
         !loading.actants && 
         !loading.conferences && 
         !loading.oeuvres && (
          <motion.div 
            className="w-full flex justify-center p-50"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={0}
          >
            <p className="text-c6 text-16">Aucun résultat trouvé</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
