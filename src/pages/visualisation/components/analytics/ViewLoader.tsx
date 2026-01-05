import React from 'react';
import { Skeleton } from '@heroui/react';

interface ViewLoaderProps {
  /** État de chargement */
  isLoading: boolean;
  /** Message d'erreur (si présent, affiche l'état d'erreur) */
  error?: string | null;
  /** Données vides (si true et pas de loading/error, affiche l'état vide) */
  isEmpty?: boolean;
  /** Icône à afficher (pour les états erreur et vide) */
  icon: React.ReactNode;
  /** Titre de la vue (affiché dans les états erreur et vide) */
  title: string;
  /** Message pour l'état vide */
  emptyMessage?: string;
  /** Message pour l'état de chargement */
  loadingMessage?: string;
  /** Contenu à afficher quand les données sont chargées */
  children: React.ReactNode;
}

/**
 * Composant réutilisable pour gérer les états de chargement, erreur et vide
 * des vues analytics. Harmonise l'UI entre tous les composants.
 */
export const ViewLoader: React.FC<ViewLoaderProps> = ({
  isLoading,
  error,
  isEmpty,
  icon,
  title,
  emptyMessage = 'Aucune donnée disponible.',
  loadingMessage,
  children,
}) => {
  // État de chargement
  if (isLoading) {
    return (
      <div className='flex-1 w-full h-full flex items-center justify-center bg-c1 p-20'>
        <div className='flex flex-col items-center gap-12'>
          <Skeleton className='w-[500px] h-[280px] rounded-12' />
          {loadingMessage && <p className='text-c4 text-sm'>{loadingMessage}</p>}
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className='flex-1 w-full h-full flex flex-col justify-center items-center gap-12 py-50 bg-c1'>
        <div className='text-red-500'>{React.cloneElement(icon as React.ReactElement, { size: 42 })}</div>
        <div className='flex flex-col justify-center items-center gap-4'>
          <h2 className='text-c6 text-xl font-semibold'>Erreur</h2>
          <p className='text-c4 text-sm text-center max-w-400'>{error}</p>
        </div>
      </div>
    );
  }

  // État vide
  if (isEmpty) {
    return (
      <div className='flex-1 w-full h-full flex flex-col justify-center items-center gap-12 py-50 bg-c1'>
        <div className='text-c4'>{React.cloneElement(icon as React.ReactElement, { size: 42 })}</div>
        <div className='flex flex-col justify-center items-center gap-4'>
          <h2 className='text-c6 text-xl font-semibold'>{title}</h2>
          <p className='text-c4 text-sm text-center max-w-400'>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Contenu normal
  return <>{children}</>;
};

export default ViewLoader;
