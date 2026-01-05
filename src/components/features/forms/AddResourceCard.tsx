import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { PlusIcon, LinkIcon, EditIcon, CrossIcon } from '@/components/ui/icons';

export interface AddResourceCardProps {
  resourceLabel: string;           // Ex: "Retour d'expérience", "Outil"
  onLinkExisting: () => void;      // Appelé quand on veut lier une ressource existante
  onCreateNew: () => void;         // Appelé quand on veut créer une nouvelle ressource
  disabled?: boolean;
  className?: string;
}

/**
 * Carte "+ Ajouter [ressource]" avec options "Lier existant" ou "Créer nouveau"
 * Au clic, le trigger se divise en deux rectangles cote a cote
 */
export const AddResourceCard: React.FC<AddResourceCardProps> = ({
  resourceLabel,
  onLinkExisting,
  onCreateNew,
  disabled = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLinkExisting = () => {
    setIsExpanded(false);
    onLinkExisting();
  };

  const handleCreateNew = () => {
    setIsExpanded(false);
    onCreateNew();
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  // Style commun pour les cartes
  const cardBaseClass = `
    flex flex-col items-center justify-center
    min-h-[120px] p-4
    border-2 border-dashed border-c4 rounded-12
    cursor-pointer
    transition-all duration-200
    hover:border-action hover:bg-c2
  `;

  // Mode non-expande: afficher le trigger simple
  if (!isExpanded) {
    return (
      <div
        onClick={handleTriggerClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            handleTriggerClick();
          }
        }}
        className={`
          ${cardBaseClass}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <div className="flex items-center gap-2 text-c5">
          <PlusIcon size={18} />
          <span className="text-16 font-medium">
            Ajouter {resourceLabel}
          </span>
        </div>
      </div>
    );
  }

  // Mode expande: afficher les deux options cote a cote
  return (
    <div className={`relative ${className}`}>
      {/* Bouton fermer */}
      <button
        onClick={handleClose}
        className="absolute -top-2 -right-2 z-10 w-6 h-6 flex items-center justify-center bg-c3 hover:bg-c4 rounded-full transition-colors"
        aria-label="Fermer"
      >
        <CrossIcon size={12} className="text-c6" />
      </button>

      <div className="flex gap-3">
        {/* Option: Ajouter une ressource existante */}
        <div
          onClick={handleLinkExisting}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleLinkExisting();
            }
          }}
          className={`
            ${cardBaseClass}
            flex-1
          `}
        >
          <LinkIcon size={24} className="text-c5 mb-2" />
          <span className="text-14 font-medium text-c5 text-center">
            Lier une ressource existante
          </span>
        </div>

        {/* Option: Creer une nouvelle ressource */}
        <div
          onClick={handleCreateNew}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCreateNew();
            }
          }}
          className={`
            ${cardBaseClass}
            flex-1
          `}
        >
          <EditIcon size={24} className="text-c5 mb-2" />
          <span className="text-14 font-medium text-c5 text-center">
            Creer une nouvelle ressource
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Version simplifiée - juste un bouton "+" qui ouvre directement le ResourcePicker
 * Utilisée pour les keywords par exemple
 */
export interface AddButtonProps {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'chip' | 'card' | 'icon';
}

export const AddButton: React.FC<AddButtonProps> = ({
  label,
  onClick,
  disabled = false,
  size = 'md',
  variant = 'chip',
}) => {
  const sizeClasses = {
    sm: 'h-6 px-2 text-12',
    md: 'h-8 px-3 text-14',
    lg: 'h-10 px-4 text-16',
  };

  if (variant === 'icon') {
    return (
      <Button
        isIconOnly
        size={size}
        onPress={onClick}
        isDisabled={disabled}
        className="bg-c3 text-c6 hover:bg-action hover:text-selected rounded-full transition-all duration-200"
      >
        <PlusIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <div
        onClickCapture={disabled ? undefined : onClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            onClick();
          }
        }}
        className={`
          flex flex-col items-center justify-center
          min-h-[80px] p-3
          border-2 border-dashed border-c4 rounded-8
          cursor-pointer
          transition-all duration-200
          hover:border-action hover:bg-c2
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <PlusIcon size={20} className="text-c5" />
        {label && <span className="text-12 text-c5 mt-1">{label}</span>}
      </div>
    );
  }

  // Default: chip style
  return (
    <Button
      size={size}
      onPress={onClick}
      isDisabled={disabled}
      className={`
        ${sizeClasses[size]}
        bg-c3 text-c6
        hover:bg-action hover:text-selected
        rounded-full
        transition-all duration-200
        flex items-center gap-1
      `}
      startContent={<PlusIcon size={size === 'sm' ? 12 : 14} />}
    >
      {label || 'Ajouter'}
    </Button>
  );
};

export default AddResourceCard;
