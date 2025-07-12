import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import countries from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Props for the map component: list of country names in French
type MapHighlightProps = {
  highlightedCountries: string[];
};

// GeoJSON endpoint for rendering world map shapes
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Register French and English locales for country name translation
countries.registerLocale(frLocale);
countries.registerLocale(enLocale);

// Translate country names from French to English using ISO codes
const translateCountries = (frCountries: string[]): string[] => {
  return frCountries.map(name => {
    const isoCode = countries.getAlpha3Code(name, 'fr');
    if (!isoCode) return null;
    return countries.getName(isoCode, 'en');
  }).filter(Boolean) as string[];
};

// Composant Geography mémorisé pour éviter les re-renders
const MemoizedGeography = React.memo<{
  geography: any;
  isHighlighted: boolean;
}>(({ geography, isHighlighted }) => (
  <Geography
    key={geography.rsmKey}
    geography={geography}
    className={`${!isHighlighted ? 'fill-c3' : 'fill-action2'} stroke-c1 cursor-pointer`}
    strokeWidth={0.5}
    style={{
      default: { outline: 'none' },
      hover: { outline: 'none' },
      pressed: { outline: 'none' },
    }}
  />
));

export const ActantsWorldMap: React.FC<MapHighlightProps> = ({ highlightedCountries }) => {
  const [translatedCountries, setTranslatedCountries] = useState<string[]>([]);

  // Save in memory countries traduction
  const translatedCountriesSet = useMemo(() => {
    return new Set(translatedCountries);
  }, [translatedCountries]);

  // Translate countries whenever input list changes
  useEffect(() => {
    setTranslatedCountries(translateCountries(highlightedCountries));
  }, [highlightedCountries]);

  // Save in memory geography filter
  const filterGeographies = useCallback((geographies: any[]) => {
    return geographies.filter(geo => geo.properties.name !== 'Antarctica');
  }, []);

  // Save in memory geography render
  const renderGeographies = useCallback((geographies: any[]) => {
    const filteredGeographies = filterGeographies(geographies);
    
    return filteredGeographies.map(geo => {
      const countryName = geo.properties.name;
      const isHighlighted = translatedCountriesSet.has(countryName);
      
      return (
        <MemoizedGeography
          key={geo.rsmKey}
          geography={geo}
          isHighlighted={isHighlighted}
        />
      );
    });
  }, [translatedCountriesSet, filterGeographies]);

  return (
    <div className='flex flex-col gap-50'>
      {/* Section title */}
      <div className='flex flex-col items-center justify-center gap-20'>
        <p className='text-c5 text-16 z-[12] text-center'>Un réseau mondial</p>
        <h2 className='text-24 font-medium text-c6 text-center leading-[120%]'>
          Le réseau EdiSem rassemble une constellation de penseurs,<br/>
          chercheur·es, artistes et praticien·nes du monde entier.
        </h2>
      </div>
      {/* Map container */}
      <div className="w-full h-auto">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 100, center: [0, 40] }}
          width={980}
          height={450}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) => renderGeographies(geographies)}
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
};