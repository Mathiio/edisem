
// Navigation utilities
export const buildConfsRoute = (confType: string, id: number): string => {
  switch (confType) {
    case 'seminar':
      return `/corpus/seminaires/conference/${id}`;
    case 'colloque':
      return `/corpus/colloques/conference/${id}`;
    case 'studyday':
      return `/corpus/journees-etudes/conference/${id}`;
    default:
      return `/`;
  }
};



////////////////////////////////////////////////////////////////////////////
///////////////////////////    DATE UTILITIES    ///////////////////////////
////////////////////////////////////////////////////////////////////////////

export const formatDate = (dateString: string): string => {
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
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getYear = (dateString: string): string => {
  return dateString.split('-')[0];
};




////////////////////////////////////////////////////////////////////////////
//////////////////////////    MEDIA UTILITIES    ///////////////////////////
////////////////////////////////////////////////////////////////////////////

export const getYouTubeThumbnailUrl = (ytb: string): string => {
  const videoId = ytb.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )?.[1];
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : '';
};

export const getYouTubeVideoId = (url: string): string | null => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return getYouTubeVideoId(url) !== null;
};




////////////////////////////////////////////////////////////////////////////
//////////////////////////    STRING UTILITIES    //////////////////////////
////////////////////////////////////////////////////////////////////////////

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};