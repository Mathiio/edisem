import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layouts } from "@/components/layout/Layouts";
import * as Items from '@/services/Items';
import { motion, Variants } from 'framer-motion';
import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { ResourceCard, ResourceCardSkeleton } from '@/components/features/corpus/ResourceCard';
import { getResourceConfigByCollectionUrl } from '@/config/resourceConfig';

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

// Map resource types to their fetcher functions
const FETCHER_MAP: Record<string, () => Promise<any[]>> = {
  'recit_scientifique': Items.getRecitsScientifiquesCards,
  'recit_techno_industriel': Items.getRecitsTechnoCards,
  'recit_citoyen': Items.getRecitsCitoyensCards,
  'recit_mediatique': Items.getRecitsMediatiquesCards,
  'recit_artistique': Items.getRecitsArtistiquesCards,
};

export const RecitsByGenre: React.FC = () => {
    const location = useLocation();
    const [recits, setRecits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Get config from RESOURCE_TYPES using collection URL
    const config = getResourceConfigByCollectionUrl(location.pathname);
    const fetcher = config ? FETCHER_MAP[config.type] : null;

    useEffect(() => {
        const loadData = async () => {
            if (!config || !fetcher) return;
            
            setLoading(true);
            try {
                const data = await fetcher();
                setRecits(data);
            } catch (error) {
                console.error(`Failed to load data for ${config.label}`, error);
                setRecits([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [config, fetcher]);

    if (!config) {
        return (
            <Layouts className='col-span-10 flex flex-col items-center justify-center min-h-[50vh]'>
                <p className="text-c4">Type de récit non trouvé.</p>
            </Layouts>
        );
    }

    const Icon = config.icon;

    return (
        <Layouts className='col-span-10 flex flex-col gap-100'>
             {/* Header section similar to OeuvresByGenre */}
            <div className='pt-100 justify-center flex items-center flex-col gap-20 relative'>
                <div className='gap-10 justify-between flex items-center flex-col'>
                    {/* Icon with custom color */}
                    {Icon && <Icon size={40} style={{ color: config.color }} />}

                    {/* Title and description */}
                    <h1 className='z-[12] text-64 text-c6 font-medium flex text-center flex-col items-center max-w-[850px] leading-tight'>
                        {config.collectionLabel || config.label}
                    </h1>
                    <p className='text-c5 text-16 z-[12] text-center max-w-[600px]'>
                        Découvrez les {recits.length} éléments dans cette collection.
                    </p>

                    {/* Background ellipse */}
                    <motion.div
                        className='top-[-50px] absolute z-[-1]'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: 'easeIn' }}
                    >
                        <div className='opacity-20 dark:opacity-30'>
                            <BackgroundEllipse />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Grid of Recits */}
            <div className='grid grid-cols-4 grid-rows-auto gap-20 pb-100'>
                {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="h-full">
                            <ResourceCardSkeleton />
                        </div>
                    ))
                    : recits.map((recit, index) => (
                        <motion.div 
                            initial='hidden' 
                            animate='visible' 
                            variants={fadeIn} 
                            key={recit.id || index} 
                            custom={index}
                        >
                            <ResourceCard item={recit} />
                        </motion.div>
                    ))
                }
            </div>
            
            {!loading && recits.length === 0 && (
                <div className='flex flex-col items-center justify-center py-20 gap-20'>
                  <div className='flex flex-col gap-10 text-center'>
                    <h3 className='text-24 font-medium text-c6'>Aucun récit trouvé</h3>
                    <p className='text-16 text-c4'>Il n'y a pas encore d'éléments dans cette collection.</p>
                  </div>
                </div>
            )}
        </Layouts>
    );
};