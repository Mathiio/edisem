import React, { useMemo } from 'react';
import { Actant } from '@/types/ui';



interface IntervenantsStatisticsProps {
  intervenants: Actant[];
}

const IntervenantsStats: React.FC<IntervenantsStatisticsProps> = ({ intervenants }) => {
  const statistics = useMemo(() => {
    if (!intervenants?.length) {
      return {
        intervenantsCount: '0+',
        universitiesCount: 0,
        laboratoriesCount: 0,
        countriesCount: 0
      };
    }

    // 1. Nombre d'intervenants arrondi à la dizaine inférieure
    const totalIntervenants = intervenants.length;
    const intervenantsRounded = Math.floor(totalIntervenants / 10) * 10;
    const intervenantsCount = intervenantsRounded === 0 ? totalIntervenants.toString() : `${intervenantsRounded}+`;

    // 2. Nombre d'universités uniques
    const universitiesSet = new Set<string>();
    intervenants.forEach(intervenant => {
      if (intervenant.universities?.length) {
        intervenant.universities.forEach(uni => {
          if (uni?.id) universitiesSet.add(uni.id);
        });
      }
    });

    // 3. Nombre de laboratoires uniques
    const laboratoriesSet = new Set<string>();
    console.log(intervenants)
    intervenants.forEach(intervenant => {
      if (intervenant.laboratories?.length) {
        console.log("+ 1 lab")
        intervenant.laboratories.forEach(lab => {
          if (lab?.id) laboratoriesSet.add(lab.id);
        });
      }
    });

    // 4. Nombre de pays uniques
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

  const StatCard = ({ label, value, color }: {
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistiques des Intervenants</h2>
        <p className="text-gray-600">Aperçu des données de la communauté académique</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Intervenants"
          value={statistics.intervenantsCount}
          color="bg-blue-500"
        />
        
        <StatCard
          label="Universités"
          value={statistics.universitiesCount}
          color="bg-green-500"
        />
        
        <StatCard
          label="Laboratoires"
          value={statistics.laboratoriesCount}
          color="bg-purple-500"
        />
        
        <StatCard
          label="Pays"
          value={statistics.countriesCount}
          color="bg-orange-500"
        />
      </div>
      
      {/* Détails supplémentaires */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>
            Total exact d'intervenants: <span className="font-semibold text-gray-900">{intervenants?.length || 0}</span>
          </span>
          <span>•</span>
          <span>
            Dernière mise à jour: <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('fr-FR')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default IntervenantsStats;