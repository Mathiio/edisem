import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IntervenantCard, IntervenantSkeleton } from '@/components/features/intervenants/IntervenantCards';
import { InfiniteSlider } from '@/components/features/home/InfiniteSlider';
import { getActants } from '@/services/Items';



export const IntervenantsSection: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [sliderGroups, setSliderGroups] = useState<any[][]>([]);


    useEffect(() => {
    const fetchAndGroupActants = async () => {
        setLoading(true);
        try {
            const data = await getActants();
            const shuffled = [...data].sort(() => Math.random() - 0.5);
            const groups = Array.from({ length: 3 }, (_, i) =>
                shuffled.slice(i * 8, (i + 1) * 8)
        );
        setSliderGroups(groups);
        } catch (error) {
            console.error("Erreur lors du chargement des intervenants", error);
        } finally {
            setLoading(false);
        }
    };
    fetchAndGroupActants();
    }, []);


  return (
    <section className="flex gap-50 h-[600px]">
      {/* Left side - Title and description */}
      <div className="flex-1 flex flex-col justify-center gap-20 max-w-40">
        <h2 className="text-c6 text-64 transition-all ease-in-out duration-200"> Intervenants & <br/> Conférenciers </h2>
        <p className="text-c5 text-16 transition-all ease-in-out duration-200 max-w-md">
          Découvrez les chercheur·e·s, artistes et invité·e·s ayant contribué aux séminaires, colloques, journées d'études et œuvres d'EdiSem.
        </p>
        <Link 
          to="/intervenants" 
          className="hover:bg-c3 bg-c2 border-c3 shadow-[inset_0_0px_10px_rgba(255,255,255,0.05)] w-fit cursor-pointer px-15 py-10 text-16 gap-10 text-c6 rounded-8 border-2 transition-all ease-in-out duration-200"
        >
          <div className="font-medium">Voir plus</div>
        </Link>
      </div>

      {/* Right side - 3 infinite sliders */}
      <div className="flex-1 flex gap-4 relative">
        {/* Fade overlays */}
        <div className="absolute top-0 h-64 w-full z-10 pointer-events-none fade-bottom" />
        <div className="absolute bottom-0 h-64 w-full z-10 pointer-events-none fade-top" />
        
        {loading ? (
          // Loading state: 3 skeleton columns
          Array.from({ length: 3 }).map((_, sliderIndex) => (
            <InfiniteSlider
              key={sliderIndex}
              cards={Array.from({ length: 8 }).map((_,) => 
                <IntervenantSkeleton />
              )}
              direction={sliderIndex % 2 === 0 ? 'down' : 'up'}
              speed={0.5 + (sliderIndex * 0.2)}
              className="flex-1"
              cardHeight={240}
            />
          ))
        ) : (
          // Loaded state: 3 sliders with actual data
          sliderGroups.map((group, sliderIndex) => (
            <InfiniteSlider
              key={sliderIndex}
              cards={group.map((item) => 
                <IntervenantCard {...item} />
              )}
              direction={sliderIndex % 2 === 0 ? 'down' : 'up'}
              speed={0.5 + (sliderIndex * 0.2)}
              className="flex-1"
              cardHeight={240}
            />
          ))
        )}
      </div>
    </section>
  );
};