import React, { useState } from 'react';
import { WorldMapVisualization } from '@/components/features/actants/WorldMapVisualization.tsx';
import { useCountryData } from '@/components/features/actants/CountryUtils';
import { CountryModal } from '@/components/features/actants/CountryModal';
import { Actant, University } from '@/types/ui';



interface IntervenantsWorldMapProps {
  universities: University[]; // University metadata
  actants: Actant[]; // List of actants for the university
}

export const IntervenantsWorldMap: React.FC<IntervenantsWorldMapProps> = ({
  actants,
  universities,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // Country selected by user
  const {translatedCountriesSet, getActantsByUniversityFromCountry} = useCountryData(universities, actants);// Countries to highlight & Actants by university

  const handleCloseModal = () => setSelectedCountry(null); // Close the modal

  const universityGroups = selectedCountry ? getActantsByUniversityFromCountry(selectedCountry) : []; // Get data for selected country

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

      {/* Modal showing actants grouped by university for selected country */}
      <CountryModal
        selectedCountry={selectedCountry}
        universityGroups={universityGroups}
        onClose={handleCloseModal}
      />
    </div>
  );
};