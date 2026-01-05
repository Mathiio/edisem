import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spinner } from '@heroui/react';
import { getYouTubeThumbnailUrl, isValidYouTubeUrl } from '@/lib/utils';
import { AddResourceCard } from '@/components/features/forms/AddResourceCard';

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
  onNavigate?: (url: string) => void; // Callback pour navigation avec animation
  animationDelay?: number; // Délai en ms avant navigation (pour laisser l'animation jouer)
}

export const ToolItem: React.FC<ToolItemProps> = ({ tool, onNavigate, animationDelay = 450 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  // Récupérer l'URL
  const itemUrl = tool.url || tool.uri || '#';

  // Gestion du clic avec animation
  const handleClick = (e: React.MouseEvent) => {
    // Si c'est un lien externe, laisser le comportement par défaut
    if (itemUrl.startsWith('http')) {
      return;
    }

    // Empêcher la navigation immédiate
    e.preventDefault();

    console.log('[ToolItem] handleClick - onNavigate:', !!onNavigate, 'url:', itemUrl);

    // Signaler que la navigation commence (pour déclencher l'animation)
    setIsNavigating(true);
    if (onNavigate) {
      console.log('[ToolItem] Calling onNavigate');
      onNavigate(itemUrl);
    }

    // Naviguer après le délai d'animation
    setTimeout(() => {
      console.log('[ToolItem] Navigating after delay');
      navigate(itemUrl);
    }, animationDelay);
  };

  // Récupérer la thumbnail
  const getThumbnail = (): string | undefined => {
    // console.log(`[ToolItem] Getting thumbnail for "${tool.title}" (ID: ${tool.id})`);
    // console.log(`[ToolItem] tool.thumbnail:`, tool.thumbnail);
    // console.log(`[ToolItem] tool.associatedMedia:`, tool.associatedMedia);

    if (tool.thumbnail) {
      // console.log(`[ToolItem] ✅ Using tool.thumbnail:`, tool.thumbnail);
      return tool.thumbnail;
    }

    // Si associatedMedia est un tableau, prendre le premier
    if (Array.isArray(tool.associatedMedia) && tool.associatedMedia.length > 0) {
      const firstMedia = tool.associatedMedia[0];
      // console.log(`[ToolItem] firstMedia from array:`, firstMedia);

      // Si c'est un objet
      if (typeof firstMedia === 'object' && firstMedia !== null) {
        const mediaObj = firstMedia as any; // Type assertion pour éviter les erreurs TS

        // Vérifier d'abord si l'objet a une propriété thumbnail
        // if (mediaObj.thumbnail) {
        //   // console.log(`[ToolItem] ✅ Using mediaObj.thumbnail:`, mediaObj.thumbnail);
        //   return mediaObj.thumbnail;
        // }

        // Sinon vérifier si l'objet a une propriété url
        if (mediaObj.url) {
          const mediaUrl = mediaObj.url;
          // Si l'URL est YouTube, récupérer la thumbnail
          if (isValidYouTubeUrl(mediaUrl)) {
            const ytThumb = getYouTubeThumbnailUrl(mediaUrl);
            // console.log(`[ToolItem] ✅ Using YouTube thumbnail:`, ytThumb);
            return ytThumb;
          }
          // Sinon retourner l'URL normale
          // console.log(`[ToolItem] ✅ Using mediaObj.url:`, mediaUrl);
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
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 transition-transform-colors-opacity ${isHovered ? 'border-c6' : 'border-c3'} ${isNavigating ? 'opacity-50 pointer-events-none' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Link className='w-full gap-25 py-25 pl-25 flex flex-row justify-between' to={itemUrl} target={itemUrl.startsWith('http') ? '_blank' : undefined} onClick={handleClick}>
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
      {/* {showAnnotation && (
        <div className='flex flex-col h-full py-25 pr-25'>
          <AnnotationDropdown id={Number(tool.id)} content={tool.description} image={thumbnail} type={annotationType} />
        </div>
      )} */}
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
  return (
    <div className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 transition-transform-colors-opacity border-c3 ${className}`}>
      <div className='w-full gap-25 py-25 px-25 flex flex-row justify-between'>
        <div className='flex flex-col gap-4 items-start w-full'>
          <div className='w-full flex flex-col gap-10'>
            <p className='text-c6 text-16 h-full' style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
              {content}
            </p>
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
  mapUrl?: (item: ToolItemData) => string; // Fonction pour générer l'URL
  loading?: boolean; // État de chargement
  // Props pour le mode édition
  isEditing?: boolean;
  resourceLabel?: string; // Label pour la carte "Ajouter [label]"
  onLinkExisting?: () => void;
  onCreateNew?: () => void;
  onRemoveItem?: (id: string | number) => void;
  onNavigate?: (url: string) => void; // Callback pour animation avant navigation
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  mapUrl,
  loading = false,
  isEditing = false,
  resourceLabel = 'ressource',
  onLinkExisting,
  onCreateNew,
  onRemoveItem,
  onNavigate,
}) => {
  // Normaliser items pour s'assurer que c'est toujours un tableau
  const itemsArray = Array.isArray(items) ? items : items ? [items] : [];

  // Afficher un spinner si en cours de chargement
  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Spinner size='lg' />
        <span className='ml-3 text-c5'>Chargement des ressources...</span>
      </div>
    );
  }

  // En mode non-édition, ne rien afficher si pas d'items
  if (!isEditing && itemsArray.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col gap-10'>
      {itemsArray.map((item) => {
        // Si mapUrl est fourni, créer un nouvel objet avec l'URL mappée
        const mappedItem = mapUrl ? { ...item, url: mapUrl(item) } : item;

        return (
          <div key={item.id} className='relative group'>
            <ToolItem tool={mappedItem} onNavigate={onNavigate} />
            {/* Bouton de suppression en mode édition */}
            {isEditing && onRemoveItem && (
              <button
                onClick={() => onRemoveItem(item.id)}
                className='absolute top-2 right-2 w-6 h-6 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm'
                title='Supprimer'>
                ×
              </button>
            )}
          </div>
        );
      })}

      {/* Carte "Ajouter" en mode édition */}
      {isEditing && onLinkExisting && onCreateNew && <AddResourceCard resourceLabel={resourceLabel} onLinkExisting={onLinkExisting} onCreateNew={onCreateNew} />}
    </div>
  );
};
