import React, { useState } from 'react';
import { WorldMapVisualization } from '@/components/features/intervenants/WorldMapVisualization.tsx';
import { useCountryData } from '@/components/features/intervenants/CountryUtils';
import { CountryModal } from '@/components/features/intervenants/CountryModal';
import { Actant, University } from '@/types/ui';



interface IntervenantsWorldMapProps {
  universities: University[]; // University metadata
  intervenants: Actant[]; // List of intervenants for the university
}

export const IntervenantsWorldMap: React.FC<IntervenantsWorldMapProps> = ({
  intervenants,
  universities,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // Country selected by user
  const {translatedCountriesSet, getIntervenantsByUniv} = useCountryData(universities, intervenants);// Countries to highlight & Intervenants by university

  const handleCloseModal = () => setSelectedCountry(null); // Close the modal

  const universityGroups = selectedCountry ? getIntervenantsByUniv(selectedCountry) : []; // Get data for selected country

  return (
    <div className='flex flex-col gap-50'>
      {/* Title Section */}
      <div className='flex flex-col items-center justify-center gap-20'>
        <p className='text-c5 text-16 z-[12] text-center'>Un réseau mondial</p>
        <h2 className='text-24 font-medium text-c6 text-center leading-[120%]'>
          Le réseau EdiSem rassemble une constellation de penseurs,<br />
          chercheur·es, artistes et praticien·nes du monde entier.
        </h2>
      </div>

      {/* Interactive world map with clickable countries */}
      <WorldMapVisualization
        highlightedCountries={translatedCountriesSet}
        onCountryClick={setSelectedCountry}
      />

      {/* Modal showing intervenants grouped by university for selected country */}
      <CountryModal
        selectedCountry={selectedCountry}
        universityGroups={universityGroups}
        onClose={handleCloseModal}
      />
    </div>
  );
};