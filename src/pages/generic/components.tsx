import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnnotationDropdown } from '@/components/features/conference/AnnotationDropdown';

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
    if (tool.thumbnail) return tool.thumbnail;

    // Si associatedMedia est un tableau, prendre le premier
    if (Array.isArray(tool.associatedMedia) && tool.associatedMedia.length > 0) {
      return tool.associatedMedia[0];
    }

    // Si associatedMedia est une string
    if (typeof tool.associatedMedia === 'string') {
      return tool.associatedMedia;
    }

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
// EmptyState - Afficher quand il n'y a pas de données
// ========================================

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message = 'Aucune donnée disponible' }) => {
  return (
    <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-center'>
      <p className='text-c4 text-14'>{message}</p>
    </div>
  );
};

// ========================================
// ItemsList - Liste d'items avec ToolItem
// ========================================

interface ItemsListProps {
  items: ToolItemData[];
  emptyMessage?: string;
  showAnnotation?: boolean;
  annotationType?: string;
  mapUrl?: (item: ToolItemData) => string; // Fonction pour générer l'URL
}

export const ItemsList: React.FC<ItemsListProps> = ({ items, emptyMessage = 'Aucun élément disponible', showAnnotation = true, annotationType = 'Bibliographie', mapUrl }) => {
  if (!items || items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className='flex flex-col gap-10'>
      {items.map((item) => {
        // Si mapUrl est fourni, créer un nouvel objet avec l'URL mappée
        const mappedItem = mapUrl ? { ...item, url: mapUrl(item) } : item;

        return <ToolItem key={item.id} tool={mappedItem} showAnnotation={showAnnotation} annotationType={annotationType} />;
      })}
    </div>
  );
};
