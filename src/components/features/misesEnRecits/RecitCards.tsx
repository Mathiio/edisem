import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PratiqueNarrativeIcon } from '@/components/ui/icons';
import { ResourceCard, ResourceCardSkeleton } from '@/components/ui/ResourceCard';
import { getYouTubeThumbnailUrl } from '@/lib/utils';

// Types of recits as it is defined in Items.ts
export type RecitType = 'recitCitoyen' | 'recitMediatique' | 'recitScientifique' | 'recitTechnoIndustriel' | 'recitArtistique';

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
    switch (type) {
      case 'recitCitoyen':
        navigate(`/corpus/recit-citoyen/${recit.id}`);
        return;
      case 'recitMediatique':
        navigate(`/corpus/recit-mediatique/${recit.id}`);
        return;
      case 'recitScientifique':
        navigate(`/corpus/recit-scientifique/${recit.id}`);
        return;
      case 'recitTechnoIndustriel':
        navigate(`/corpus/recit-techno-industriel/${recit.id}`);
        return;
      case 'recitArtistique':
        navigate(`/corpus/recit-artistique/${recit.id}`);
        return;
      default:
        console.warn('Type of recit unknown for navigation:', type);
        return;
    }
  };

  // 3. Date
  const getDateLine = () => {
    const date = recit.dateIssued || recit.date || "Date inconnue";
    if (type === 'recitCitoyen') return `Fondé : ${date}`;
    return `Publié : ${date}`;
  };

  // 4. Author Name Logic
  const getAuthorName = () => {
    // Case Recit Techno-Industriel
    if (type === 'recitTechnoIndustriel' && typeof recit.creator === 'string') {
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

  // 5. Badges & Colors
  const getTypeBadgeLabel = () => {
    switch (type) {
      case 'recitCitoyen': return 'Mise en Récit Citoyen';
      case 'recitMediatique': return 'Mise en Récit Médiatique';
      case 'recitScientifique': return 'Mise en Récit Scientifique';
      case 'recitTechnoIndustriel': return 'Mise en Récit Techno-Industriel';
      case 'recitArtistique': return 'Mise en Récit Artistique';
      default: return 'Mise en Récit';
    }
  };

  const getTypeBadgeColor = () => {
    switch (type) {
      case 'recitCitoyen': return '#C8F3C9';
      case 'recitMediatique': return '#FFF1B8';
      case 'recitScientifique': return '#86A4E7';
      case 'recitTechnoIndustriel': return '#ADCFEC';
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
        typeLabel={getTypeBadgeLabel()}
        TypeIcon={PratiqueNarrativeIcon}
        typeColor={getTypeBadgeColor()}
    />
  );
};

export const RecitCardSkeleton: React.FC = () => {
    return <ResourceCardSkeleton />;
};
