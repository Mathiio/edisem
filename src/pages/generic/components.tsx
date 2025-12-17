import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnnotationDropdown } from '@/components/features/conference/AnnotationDropdown';
import { getYouTubeThumbnailUrl, isValidYouTubeUrl } from '@/lib/utils';

/**
 * Composants réutilisables pour les viewOptions
 *
 * Évite de copier-coller le même code dans chaque config!
 */

// ========================================
// ToolItem - Composant de base pour afficher un item avec image, titre, description
// ========================================

export interface ToolItemData {
  id: string | number;
  title: string;
  url?: string;
  uri?: string; // Certains items utilisent uri au lieu de url
  thumbnail?: string;
  description?: string;
  associatedMedia?: string | string[]; // Peut être une string ou un tableau
}

interface ToolItemProps {
  tool: ToolItemData;
  showAnnotation?: boolean; // Par défaut true
  annotationType?: string; // Par défaut 'Bibliographie'
}

export const ToolItem: React.FC<ToolItemProps> = ({ tool, showAnnotation = true, annotationType = 'Bibliographie' }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Récupérer l'URL
  const itemUrl = tool.url || tool.uri || '#';

  // Récupérer la thumbnail
  const getThumbnail = (): string | undefined => {
    console.log(`[ToolItem] Getting thumbnail for "${tool.title}" (ID: ${tool.id})`);
    console.log(`[ToolItem] tool.thumbnail:`, tool.thumbnail);
    console.log(`[ToolItem] tool.associatedMedia:`, tool.associatedMedia);

    if (tool.thumbnail) {
      console.log(`[ToolItem] ✅ Using tool.thumbnail:`, tool.thumbnail);
      return tool.thumbnail;
    }

    // Si associatedMedia est un tableau, prendre le premier
    if (Array.isArray(tool.associatedMedia) && tool.associatedMedia.length > 0) {
      const firstMedia = tool.associatedMedia[0];
      console.log(`[ToolItem] firstMedia from array:`, firstMedia);

      // Si c'est un objet
      if (typeof firstMedia === 'object' && firstMedia !== null) {
        const mediaObj = firstMedia as any; // Type assertion pour éviter les erreurs TS

        // Vérifier d'abord si l'objet a une propriété thumbnail
        if (mediaObj.thumbnail) {
          console.log(`[ToolItem] ✅ Using mediaObj.thumbnail:`, mediaObj.thumbnail);
          return mediaObj.thumbnail;
        }

        // Sinon vérifier si l'objet a une propriété url
        if (mediaObj.url) {
          const mediaUrl = mediaObj.url;
          // Si l'URL est YouTube, récupérer la thumbnail
          if (isValidYouTubeUrl(mediaUrl)) {
            const ytThumb = getYouTubeThumbnailUrl(mediaUrl);
            console.log(`[ToolItem] ✅ Using YouTube thumbnail:`, ytThumb);
            return ytThumb;
          }
          // Sinon retourner l'URL normale
          console.log(`[ToolItem] ✅ Using mediaObj.url:`, mediaUrl);
          return mediaUrl;
        }
      }

      // Si c'est une string, la retourner directement
      if (typeof firstMedia === 'string') {
        console.log(`[ToolItem] ✅ Using firstMedia string:`, firstMedia);
        return firstMedia;
      }
    }

    // Si associatedMedia est une string
    if (typeof tool.associatedMedia === 'string') {
      console.log(`[ToolItem] ✅ Using associatedMedia string:`, tool.associatedMedia);
      return tool.associatedMedia;
    }

    console.log(`[ToolItem] ❌ No thumbnail found`);
    return undefined;
  };

  const thumbnail = getThumbnail();

  return (
    <div
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 transition-transform-colors-opacity ${isHovered ? 'border-c6' : 'border-c3'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Link className='w-full gap-25 py-25 pl-25 flex flex-row justify-between' to={itemUrl} target={itemUrl.startsWith('http') ? '_blank' : undefined}>
        <div className='flex flex-row gap-4 items-start'>
          {thumbnail && (
            <div className='flex-shrink-0'>
              <img src={thumbnail} alt='thumbnail' className='w-50 object-cover rounded-6' />
            </div>
          )}
          <div className='w-full flex flex-col gap-10'>
            <p className='text-c6 text-16'>{tool.title}</p>
            {tool.description && <p className='text-c4 text-14 leading-[120%] text-overflow-ellipsis line-clamp-3 w-full'>{tool.description}</p>}
          </div>
        </div>
      </Link>
      {showAnnotation && (
        <div className='flex flex-col h-full py-25 pr-25'>
          <AnnotationDropdown id={Number(tool.id)} content={tool.description} image={thumbnail} type={annotationType} />
        </div>
      )}
    </div>
  );
};

// ========================================
// SimpleTextBlock - Afficher du texte simple avec border
// ========================================

interface SimpleTextBlockProps {
  content: string;
  className?: string;
}

export const SimpleTextBlock: React.FC<SimpleTextBlockProps> = ({ content, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 transition-transform-colors-opacity ${
        isHovered ? 'border-c6' : 'border-c3'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className='w-full gap-25 py-25 px-25 flex flex-row justify-between'>
        <div className='flex flex-col gap-4 items-start'>
          <div className='w-full flex flex-col gap-10'>
            <p className='text-c6 text-16'>{content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// ItemsList - Liste d'items avec ToolItem
// ========================================

interface ItemsListProps {
  items: ToolItemData[];
  showAnnotation?: boolean;
  annotationType?: string;
  mapUrl?: (item: ToolItemData) => string; // Fonction pour générer l'URL
}

export const ItemsList: React.FC<ItemsListProps> = ({ items, showAnnotation = true, annotationType = 'Bibliographie', mapUrl }) => {
  // Normaliser items pour s'assurer que c'est toujours un tableau
  const itemsArray = Array.isArray(items) ? items : items ? [items] : [];
  
  if (itemsArray.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col gap-10'>
      {itemsArray.map((item) => {
        // Si mapUrl est fourni, créer un nouvel objet avec l'URL mappée
        const mappedItem = mapUrl ? { ...item, url: mapUrl(item) } : item;

        return <ToolItem key={item.id} tool={mappedItem} showAnnotation={showAnnotation} annotationType={annotationType} />;
      })}
    </div>
  );
};
