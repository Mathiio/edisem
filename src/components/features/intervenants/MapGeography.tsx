import React from 'react';
import { Geography } from 'react-simple-maps';


type MapGeographyProps = {
  geography: any; // GeoJSON data for the country shape
  isHighlighted: boolean; // The country should be visually highlighted
  onClick?: (countryName: string) => void; // Callback when a country is clicked
};

export const MapGeography = React.memo<MapGeographyProps>(
  ({ geography, isHighlighted, onClick }) => {
    return (
      <Geography
        key={geography.rsmKey}
        geography={geography}
        onClick={() => onClick?.(geography.properties.name)}
        className={`${!isHighlighted ? 'fill-c3' : 'fill-action2'} stroke-c1 cursor-pointer`}
        strokeWidth={0.5}
        style={{
          default: { outline: 'none' },
          hover: { outline: 'none' },
          pressed: { outline: 'none' },
        }}
      />
    );
  }
);