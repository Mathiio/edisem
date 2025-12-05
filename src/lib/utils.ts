
// Navigation utilities
export const buildConfsRoute = (confType: string, id: number): string => {
  switch (confType) {
    case 'seminar':
      return `/corpus/seminaires/conference/${id}`;
    case 'colloque':
      return `/corpus/colloques/conference/${id}`;
    case 'studyday':
      return `/corpus/journees-etudes/conference/${id}`;
    case 'oeuvre':
      return `/corpus/oeuvre/${id}`;
    case 'objetTechnoIndustriel':
      return `/corpus/objet-techno/${id}`;
    case 'experimentation':
      return `/corpus/experimentation/${id}`;
    case 'elementNarratif':
      return `/corpus/element-narratif/${id}`;
    case 'elementEsthetique':
      return `/corpus/element-esthetique/${id}`;
    case 'annotation':
      return `/corpus/analyse-critique/${id}`;
    case 'feedback':
      return `/feedback/${id}`;
    case 'tool':
      return `/corpus/tool/${id}`;
    case 'miseEnRecit':
      return `/corpus/mise-en-recit/${id}`;
    case 'documentationScientifique':
      return `/corpus/documentation-scientifique/${id}`;
    case 'recitMediatique':
      return `/corpus/recit-mediatique/${id}`;
    default:
      return `/`;
  }
};



////////////////////////////////////////////////////////////////////////////
///////////////////////////    DATE UTILITIES    ///////////////////////////
////////////////////////////////////////////////////////////////////////////

export const formatDate = (dateString: string): string => {
  // Vérifier que dateString est une chaîne de caractères
  if (typeof dateString !== 'string' || !dateString) {
    return '';
  }
  
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const dateParts = dateString.split('-');
  const year = dateParts[0];
  const monthIndex = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  
  return `${day} ${mois[monthIndex]} ${year}`;
};

export const formatDateShort = (dateString: string): string => {
  // Vérifier que dateString est une chaîne de caractères
  if (typeof dateString !== 'string' || !dateString) {
    return '';
  }
  
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getYear = (dateString: string): string => {
  // Vérifier que dateString est une chaîne de caractères
  if (typeof dateString !== 'string' || !dateString) {
    return '';
  }
  
  return dateString.split('-')[0];
};

export const getSeasonOrder = (season: string) => {
  const seasonOrder: Record<string, number> = {
    'automne': 3,
    'été': 2,
    'printemps': 1,
    'hiver': 0
  };
  return seasonOrder[season] || 0;
};





////////////////////////////////////////////////////////////////////////////
//////////////////////////    MEDIA UTILITIES    ///////////////////////////
////////////////////////////////////////////////////////////////////////////

export const getYouTubeThumbnailUrl = (ytb: string): string => {
  // Vérifier que ytb est une chaîne de caractères
  if (typeof ytb !== 'string' || !ytb) {
    return '';
  }
  
  const videoId = ytb.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )?.[1];
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : '';
};

export const getYouTubeVideoId = (url: string): string | null => {
  // Vérifier que url est une chaîne de caractères
  if (typeof url !== 'string' || !url) {
    return null;
  }
  
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  // Vérifier que url est une chaîne de caractères
  if (typeof url !== 'string' || !url) {
    return false;
  }
  
  return getYouTubeVideoId(url) !== null;
};




////////////////////////////////////////////////////////////////////////////
//////////////////////////    STRING UTILITIES    //////////////////////////
////////////////////////////////////////////////////////////////////////////

export const truncateText = (text: string, maxLength: number): string => {
  // Vérifier que text est une chaîne de caractères
  if (typeof text !== 'string' || !text) {
    return '';
  }
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const slugUtils = {
  toSlug: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  toTitle: (slug: string): string => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  matches: (text: string, slug: string): boolean => {
    return slugUtils.toSlug(text) === slug;
  }
};

export const capitalizeFirst = (text: string): string => {
  // Vérifier que text est une chaîne de caractères
  if (typeof text !== 'string' || !text) {
    return '';
  }
  
  return text.charAt(0).toUpperCase() + text.slice(1);
};