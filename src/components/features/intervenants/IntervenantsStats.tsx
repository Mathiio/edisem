import { useMemo } from 'react';
import { Actant } from '@/types/ui';


interface IntervenantsStatisticsProps {
  intervenants: Actant[];
}

export default function IntervenantsStats({ intervenants }: IntervenantsStatisticsProps) {
  const statistics = useMemo(() => {
    if (!intervenants?.length) {
      return {
        intervenantsCount: '0+',
        universitiesCount: 0,
        laboratoriesCount: 0,
        countriesCount: 0
      };
    }

    // Round number of actants down to the nearest 10 (e.g., 93 -> "90+")
    const totalIntervenants = intervenants.length;
    const intervenantsRounded = Math.floor(totalIntervenants / 10) * 10;
    const intervenantsCount = intervenantsRounded === 0 ? totalIntervenants.toString() : `${intervenantsRounded}+`;

    // Count of unique universities (by ID)
    const universitiesSet = new Set<string>();
    intervenants.forEach(intervenant => {
      if (intervenant.universities?.length) {
        intervenant.universities.forEach(uni => {
          if (uni?.id) universitiesSet.add(uni.id);
        });
      }
    });

    // Count of unique laboratories (by ID)
    const laboratoriesSet = new Set<string>();
    intervenants.forEach(intervenant => {
      if (intervenant.laboratories?.length) {
        intervenant.laboratories.forEach(lab => {
          if (lab?.id) laboratoriesSet.add(lab.id);
        });
      }
    });

    // Count of unique countries (based on university.country field)
    const countriesSet = new Set<string>();
    intervenants.forEach(intervenant => {
      if (intervenant.universities?.length) {
        intervenant.universities.forEach(uni => {
          if (uni?.country) countriesSet.add(uni.country);
        });
      }
    });

    return {
      intervenantsCount,
      universitiesCount: universitiesSet.size,
      laboratoriesCount: laboratoriesSet.size,
      countriesCount: countriesSet.size
    };
  }, [intervenants]);

  // Small card component for displaying one stat
  const StatCard = ({ title, value, description }: {
    title: string;
    value: string | number;
    description: string;
  }) => (
    <div className="flex flex-col gap-10">
      <h3 className="text-64 text-c6 font-bold text-gray-900">{value}</h3>
      <div className="py-5 px-10 flex bg-c2 w-fit rounded-8">
        <p className="text-16 font-medium text-c5">{title}</p>
      </div>
      <p className="text-16 font-regular text-c5">{description}</p>
    </div>
  );

  return (
    <section className='flex gap-50'>
      {/* Left side – Title and description */}
      <div className='flex-1 flex flex-col justify-between'>
        <h2 className='text-c6 text-64 transition-all ease-in-out duration-200'>
          Quelques <br/>
          Statistiques
        </h2>
        <p className='text-c5 text-16 transition-all ease-in-out duration-200 max-w-md'>
          De Paris à Montréal, de Londres à Turin, en passant par Tokyo ou Boston, les intervenant·es explorent des thématiques aussi diverses que l’intelligence artificielle, les pratiques artistiques numériques, la sémiotique ou l’éthique des technologies.          
        </p>
      </div>
      {/* Right side – Grid of stat cards */}
      <div className="grid grid-cols-2 w-1/2 gap-40">
        <StatCard
          value={statistics.intervenantsCount}
          title="Intervenants identifiés"
          description="Profils issus de disciplines variées : artistes, chercheurs, philosophes, doctorants..."
        />
        <StatCard
          value={statistics.universitiesCount}
          title="Universités représentées"
          description="Université Paris 8, Laval, Montréal, Sorbonne, Utrecht, Turin, NYU, MIT..."
        />
        <StatCard
          value={statistics.laboratoriesCount}
          title="Laboratoires associés"
          description="Laboratoire Paragraphe, LaRSH, CRILCQ, LANTISS, IRCAM, CELSA..."
        />
        <StatCard
          value={statistics.countriesCount}
          title="Pays représentés"
          description="De Paris à Montréal, de Londres à Turin, en passant par Tokyo ou Boston..."
        />
      </div>
    </section>
  );
};