import { getResourceUrl } from '@/config/resourceConfig';

/**
 * Extract authors from a resource item.
 * Handles TWO types of data:
 * 1. Actant-based (Conferences/Experimentations): firstname + lastname + universities
 * 2. Creator-based (All Recits): name (display_title)
 * 
 * Supports 'actants', 'personne', 'actant' keys.
 */
export const getResourceAuthors = (item: any) => {
    const people = item.actants || item.personne || item.actant || [];
    if (!Array.isArray(people)) return [];

    return people
        .map((p: any) => {
            // Try to construct full name from firstname/lastname (Actants)
            const fullName = `${p.firstname || p.firstName || ''} ${p.lastname || p.lastName || ''}`.trim();

            // Fallback to name field (Creators - display_title)
            const name = fullName || p.name || '';

            if (!name) return null;

            return {
                name,
                picture: p.picture,
            };
        })
        .filter((a: any) => a !== null) as { name: string; picture?: string }[];
};

/**
 * Extract subtitle from a resource item.
 * - Actant-based resources (Conferences/Experimentations): universities
 * - Creator-based resources (Recits): formatted date
 */
export const getResourceSubtitle = (item: any) => {
    // For recits, use formatted date as subtitle
    if (item.type?.startsWith('recit_')) {
        return getRecitDateLine(item);
    }

    // For other resources, use universities
    const people = item.actants || item.personne || item.actant || [];
    if (!Array.isArray(people) || people.length === 0) return undefined;

    const universities = people
        .flatMap((person: any) => {
            const univs = person?.universite || person?.universities || person?.affiliations || [];
            return Array.isArray(univs) ? univs : [];
        })
        .filter(Boolean);

    if (universities.length === 0) return undefined;

    // Get unique university shortNames
    const uniqueUnivs = Array.from(
        new Set(
            universities.map((u: any) => {
                if (typeof u === 'string') return u;
                return u.shortName || u.name || 'Université';
            })
        )
    );

    return uniqueUnivs.join(' - ');
};

/**
 * Get standardized resource URL.
 * Wrapper around getResourceUrl to handle defaults.
 */
export const getSafeResourceUrl = (item: any): string => {
    const url = getResourceUrl(item.type || 'seminaire', item.id);
    return url || '#';
};

/**
 * Extract thumbnail from resource item.
 * Supports direct property or YouTube URL derivation.
 */
export const getResourceThumbnail = (item: any): string => {
    // 1. Direct string properties
    if (typeof item.thumbnail === 'string' && item.thumbnail) return item.thumbnail;
    if (typeof item.image === 'string' && item.image) return item.image;
    if (typeof item.picture === 'string' && item.picture) return item.picture;

    // 2. Check for YouTube URL (for recits)
    if (item.url) {
        const ytThumb = getYouTubeThumbnail(item.url);
        if (ytThumb) return ytThumb;
    }

    // 3. Object properties (thumbnail.url or thumbnail.thumbnail)
    if (item.thumbnail && typeof item.thumbnail === 'object') {
        const ytThumbFromObject = getYouTubeThumbnail(item.thumbnail.url);
        if (ytThumbFromObject) return ytThumbFromObject;
        if (item.thumbnail.thumbnail) return item.thumbnail.thumbnail;
        if (item.thumbnail.url) return item.thumbnail.url; // Fallback
    }

    // 4. Array properties (take first element)
    if (Array.isArray(item.thumbnail) && item.thumbnail.length > 0) {
        return typeof item.thumbnail[0] === 'string' ? item.thumbnail[0] : item.thumbnail[0]?.url || '';
    }

    // 5. Associated Media
    if (item.associatedMedia?.[0]?.thumbnail) return item.associatedMedia[0].thumbnail;

    return '';
};

/**
 * Extract YouTube thumbnail from URL.
 * Returns high quality thumbnail or undefined if not a YouTube URL.
 */
export const getYouTubeThumbnail = (url: string | string[]): string | undefined => {
    const finalUrl = Array.isArray(url) ? url[0] : url;
    if (!finalUrl || typeof finalUrl !== 'string') return undefined;

    // Match youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
    const match = finalUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
    if (!match || !match[1]) return undefined;

    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
};

/**
 * Format date line for recits with appropriate prefix.
 * - recit_citoyen: "Fondé : [date]"
 * - Other recits: "Publié : [date]"
 */
export const getRecitDateLine = (item: any): string => {
    const date = item.dateIssued || item.date || "Date inconnue";
    if (item.type === 'recit_citoyen') return `Fondé : ${date}`;
    return `Publié : ${date}`;
};

export function generateThumbnailUrl(mediaId: string | number): string {
    const mediaIdString = String(mediaId);

    // Check if it's a YouTube media ID (typically numeric)
    if (/^\d+$/.test(mediaIdString)) {
        return `https://tests.arcanes.ca/omk/files/original/${mediaIdString}.jpg`;
    }

    return '';
}
