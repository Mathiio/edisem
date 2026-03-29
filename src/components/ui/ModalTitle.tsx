import React from 'react';
import { InfoIcon } from '@/components/ui/icons';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

export interface ModalTitleProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: IconComponent;
  iconColor?: string;
  iconBg?: string;
  /** Classes du libellé principal (ex. `text-c6 text-3xl font-medium` pour les formulaires). */
  titleClassName?: string;
  /** Zone à droite (ex. bouton fermer). */
  endContent?: React.ReactNode;
}

/** Titre de modale réutilisable : icône dans un carré coloré + titre, même principe qu’AlertModal. */
export const ModalTitle: React.FC<ModalTitleProps> = ({
  title,
  subtitle,
  icon: Icon = InfoIcon,
  iconColor = 'text-blue-500',
  iconBg = 'bg-blue-500/20',
  titleClassName = 'text-c6',
  endContent,
}) => (
  <div className='flex w-full flex-col gap-1'>
    <div className='flex w-full items-center justify-between gap-3'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <div className={`shrink-0 rounded-lg p-1 ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span className={`min-w-0 ${titleClassName}`}>{title}</span>
      </div>
      {endContent != null ? <div className='shrink-0'>{endContent}</div> : null}
    </div>
    {subtitle != null && <div className='pl-10 text-sm font-normal text-c5'>{subtitle}</div>}
  </div>
);
