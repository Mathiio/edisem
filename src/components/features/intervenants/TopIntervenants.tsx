import { TopIcon } from '@/components/ui/icons';
import { Actant } from '@/types/ui';
import { useMemo } from 'react';


// Props for main component
interface TopIntervenantsProps {
  intervenants: Actant[];
}

// Props for individual speaker cards
interface IntervenantCardProps {
  intervenant: Actant;
  position: 'first' | 'second' | 'third';
}



// Individual speaker card component
const IntervenantCard = ({ intervenant, position }: IntervenantCardProps) => {

  // Position-specific styles
  const positionStyles = {
    first: { container: 'transform -translate-y-20 z-10' },
    second: { container: 'transform translate-y-10 z-5' },
    third: { container: 'transform translate-y-10 z-5' }
  };

  const currentStyle = positionStyles[position];

  return (
    <div className={`${currentStyle.container} flex flex-col items-center justify-center gap-20 p-40 rounded-16 border-2 border-c3 w-64`}>
      {/* Speaker stats */}
      <div className='flex flex-col items-center justify-center gap-10'>
        <h3 className={`text-64 text-c6 font-bold`}>{intervenant.interventions}</h3>
        <p className='text-16 text-c5 uppercase font-bold'>
          {intervenant.firstname} {intervenant.lastname}
        </p>
        {/* University affiliations */}
        <div className='flex flex-wrap items-center justify-center gap-10 mt-10'>
          {intervenant.universities?.map((university, index) => (
            <div key={index} className='flex items-center gap-5'>
              <img src={university.logo} alt={university.shortName} className='w-20 h-20 object-cover rounded-full' />
              {index === 0 && <p className='text-12 text-c5 font-extralight'>{university.shortName}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



// Main component
export default function TopIntervenants({ intervenants }: TopIntervenantsProps) {

  // Get top 3 speakers sorted by interventions
  const topIntervenants = useMemo(() => {
    if (!intervenants?.length) return [];

    const sorted = [...intervenants];
    sorted.sort((a, b) => b.interventions - a.interventions);
    return sorted.slice(0, 3);
  }, [intervenants]);

  return (
    <section className='flex flex-col items-center justify-center gap-40 p-20'>
      {/* Section header */}
      <div className='flex flex-col items-center justify-center gap-20'>
        <TopIcon size={40} className='text-c6' />
        <h2 className='text-24 font-medium text-c6'>Top 3 des intervenants</h2>
      </div>

      {/* Podium layout */}
      {topIntervenants.length > 0 ? (
        <div className='flex items-end justify-center gap-20 p-20 w-full max-w-1000'>
          {/* Second place */}
          {topIntervenants[1] && <IntervenantCard intervenant={topIntervenants[1]} position='second' />}
          {/* First place - center */}
          {topIntervenants[0] && <IntervenantCard intervenant={topIntervenants[0]} position='first' />}
          {/* Third place */}
          {topIntervenants[2] && <IntervenantCard intervenant={topIntervenants[2]} position='third' />}
        </div>
      ) : (
        <p className='text-c5 text-16'>Aucun intervenant trouvé</p>
      )}
    </section>
  );
}