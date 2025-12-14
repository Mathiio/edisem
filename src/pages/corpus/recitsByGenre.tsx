import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layouts } from "@/components/layout/Layouts";
import * as Items from '@/services/Items';
import { PratiqueNarrativeIcon } from '@/components/ui/icons';
import { motion, Variants } from 'framer-motion';
import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';
import { RecitCard, RecitCardSkeleton } from '@/components/features/misesEnRecits/RecitCards';

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

// Configuration for each narrative type
const RECIT_TYPES_CONFIG: Record<string, {
    title: string;
    description: string;
    color: string;
    fetcher: () => Promise<any[]>;
}> = {
    '/corpus/recits-scientifiques': {
        title: 'Récits Scientifiques',
        description: 'Analyses des publications scientifiques et académiques.',
        color: '#AFC8FF',
        fetcher: Items.getRecitsScientifiques
    },
    '/corpus/recits-techno-industriels': {
        title: 'Récits Techno-Industriels',
        description: 'Étude des discours industriels et technologiques.',
        color: '#A9E2DA',
        fetcher: Items.getRecitsTechnoIndustriels
    },
    '/corpus/recits-citoyens': {
        title: 'Récits Citoyens',
        description: 'Exploration des perspectives citoyennes et sociales.',
        color: '#C8E6C9',
        fetcher: Items.getRecitsCitoyens
    },
    '/corpus/recits-mediatiques': {
        title: 'Récits Médiatiques',
        description: 'Analyse de la couverture médiatique et presse.',
        color: '#FFF1B8',
        fetcher: Items.getRecitsMediatiques
    }
};

export const RecitsByGenre: React.FC = () => {
    const location = useLocation();
    const [recits, setRecits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Determine current type based on path
    const currentPath = location.pathname;
    const config = RECIT_TYPES_CONFIG[currentPath];

    useEffect(() => {
        const loadData = async () => {
            if (!config) return;
            
            setLoading(true);
            try {
                const data = await config.fetcher();
                setRecits(data);
            } catch (error) {
                console.error(`Failed to load data for ${config.title}`, error);
                setRecits([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [config]);

    if (!config) {
        return (
            <Layouts className='col-span-10 flex flex-col items-center justify-center min-h-[50vh]'>
                <p className="text-c4">Type de récit non trouvé.</p>
            </Layouts>
        );
    }

    return (
        <Layouts className='col-span-10 flex flex-col gap-100'>
             {/* Header section similar to OeuvresByGenre */}
            <div className='pt-100 justify-center flex items-center flex-col gap-20 relative'>
                <div className='gap-10 justify-between flex items-center flex-col'>
                    {/* Icon with custom color */}
                    <PratiqueNarrativeIcon size={40} style={{ color: config.color }} />

                    {/* Title and description */}
                    <h1 className='z-[12] text-64 text-c6 font-medium flex text-center flex-col items-center max-w-[850px] leading-tight'>
                        {config.title}
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
                            <RecitCardSkeleton />
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
                            <RecitCard {...recit} />
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