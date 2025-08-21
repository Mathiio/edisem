// TopIntervenants.tsx
import { TopIcon } from '@/components/ui/icons';
import { Actant } from '@/types/ui';
import { useMemo } from 'react';

interface TopIntervenantsProps {
  intervenants: Actant[];
}

interface IntervenantCardProps {
  intervenant: Actant;
  position: 'first' | 'second' | 'third';
}

const IntervenantCard = ({ intervenant, position }: IntervenantCardProps) => {
  // Styles conditionnels en fonction de la position
  const positionStyles = {
    first: {
      container: "transform -translate-y-20 z-10",
      count: "text-64 text-c3",
    },
    second: {
      container: "transform translate-y-10 z-5",
    },
    third: {
      container: "transform translate-y-10 z-5",
    }
  };

  const currentStyle = positionStyles[position];

  return (
    <div className={`${currentStyle.container} flex flex-col items-center justify-center gap-20 p-40 rounded-16 border-2 border-c3 w-64`}>

      {/* Interventions count */}
      <div className='flex flex-col items-center justify-center gap-10'>
        <h3 className={`text-64 text-c5 font-bold`}>{intervenant.interventions}</h3>
        <p className='text-600 text-16 uppercase font-bold'>{intervenant.firstname} {intervenant.lastname}</p>

        {/* Universities */}
        <div className="flex flex-wrap items-center justify-center gap-10 mt-10">
          {intervenant.universities?.map((university, index) => (
            <div key={index} className="flex items-center gap-5">
              <img
                src={university.logo}
                alt={university.shortName}
                className='w-20 h-20 object-cover rounded-full'
              />
              {index === 0 && (
                <p className='text-12 text-c5 font-extralight'>
                  {university.shortName}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function TopIntervenants({ intervenants }: TopIntervenantsProps) {
  const topIntervenants = useMemo(() => {
    if (!intervenants?.length) return [];

    const sorted = [...intervenants];
    sorted.sort((a, b) => b.interventions - a.interventions);
    return sorted.slice(0, 3);
  }, [intervenants]);

  return (
    <section className="flex flex-col items-center justify-center gap-40 p-20">
      <div className='flex flex-col items-center justify-center gap-20'>
        <TopIcon size={40} />
        <h2 className="text-24 font-medium text-600">Top 3 des intervenants</h2>
      </div>

      {topIntervenants.length > 0 ? (
        <div className="flex items-end justify-center gap-20 p-20 w-full max-w-1000">
          {/* Deuxième place (gauche) */}
          {topIntervenants[1] && (
            <IntervenantCard
              intervenant={topIntervenants[1]}
              position="second"
            />
          )}

          {/* Première place (centre, plus haute) */}
          {topIntervenants[0] && (
            <IntervenantCard
              intervenant={topIntervenants[0]}
              position="first"
            />
          )}

          {/* Troisième place (droite) */}
          {topIntervenants[2] && (
            <IntervenantCard
              intervenant={topIntervenants[2]}
              position="third"
            />
          )}
        </div>
      ) : (
        <p className="text-c5 text-16">Aucun intervenant trouvé</p>
      )}
    </section>
  );
}
