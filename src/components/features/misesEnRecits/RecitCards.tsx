import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PratiqueNarrativeIcon } from '@/components/ui/icons';
import { ResourceCard, ResourceCardSkeleton } from '@/components/features/corpus/ResourceCard';
import { getYouTubeThumbnailUrl } from '@/lib/utils';
import { getResourceUrl } from '@/config/resourceTypes';

// Types of recits as it is defined in Items.ts
export type RecitType = 'recit_citoyen' | 'recit_mediatique' | 'recit_scientifique' | 'recit_techno_industriel' | 'recitArtistique';

interface RecitCardProps {
  [key: string]: any;
}

export const RecitCard: React.FC<RecitCardProps> = (props) => {
  const recit = props;
  const navigate = useNavigate();

  const type = recit.type as RecitType;

  // 1. URL of the thumbnail
  const thumbnailUrl = recit.thumbnail || recit.picture || (recit.url ? getYouTubeThumbnailUrl(Array.isArray(recit.url) ? recit.url[0] : recit.url) : undefined);

  // 2. Navigation
  const openRecit = () => {
    const url = getResourceUrl(type, recit.id);
    if (url && url !== '#') {
      navigate(url);
    } else {
      console.warn('Type of recit unknown for navigation:', type);
    }
  };

  // 3. Date
  const getDateLine = () => {
    const date = recit.dateIssued || recit.date || "Date inconnue";
    if (type === 'recit_citoyen') return `Fondé : ${date}`;
    return `Publié : ${date}`;
  };

  // 4. Author Name Logic
  const getAuthorName = () => {
    // Case Recit Techno-Industriel
    if (type === 'recit_techno_industriel' && typeof recit.creator === 'string') {
      return recit.creator;
    }

    // Object (Person)
    if (recit.creator && typeof recit.creator === 'object') {
      const c = recit.creator;
      const name = `${c.firstname || c.firstName || ''} ${c.lastname || c.lastName || ''}`.trim();
      if (name) return name;
      return c.name || "Ateur Inconnu";
    }

    // String ID or simple string
    if (typeof recit.creator === 'string') return recit.creator;

    // Fallbacks
    if (recit.publisher) return recit.publisher;
    if (recit.source) return recit.source;

    return "Non spécifié";
  };



  const getTypeBadgeColor = () => {
    switch (type) {
      case 'recit_citoyen': return '#C8F3C9';
      case 'recit_mediatique': return '#FFF1B8';
      case 'recit_scientifique': return '#86A4E7';
      case 'recit_techno_industriel': return '#ADCFEC';
      case 'recitArtistique': return '#EDB9EB';
      default: return '#E0E0E0';
    }
  };

  return (
    <ResourceCard 
        title={recit.title}
        thumbnailUrl={thumbnailUrl}
        onClick={openRecit}
        authors={[{ name: getAuthorName() }]}
        date={getDateLine()}
        type={recit.type}
        TypeIcon={PratiqueNarrativeIcon}
        typeColor={getTypeBadgeColor()}
    />
  );
};

export const RecitCardSkeleton: React.FC = () => {
    return <ResourceCardSkeleton />;
};
