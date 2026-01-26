import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { GenericDetailPage } from './GenericDetailPage';
import { GenericDetailPageConfig, PageMode } from './config';
import { StudentFormWrapper } from '@/components/features/forms/StudentFormWrapper';

interface ConfigurableDetailPageProps {
  config: GenericDetailPageConfig;
  initialMode?: PageMode;
}

/**
 * Wrapper pour utiliser les configs directement dans les routes
 * sans avoir besoin de créer un fichier page séparé
 *
 * Usage dans App.tsx:
 * <Route path='/conference/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
 * <Route path='/add-resource/experimentation' element={<ConfigurableDetailPage config={experimentationConfig} initialMode="create" />} />
 *
 * En mode view: affiche GenericDetailPage directement
 * En mode edit/create: utilise StudentFormWrapper pour permettre les onglets
 */
export const ConfigurableDetailPage: React.FC<ConfigurableDetailPageProps> = ({ config, initialMode = 'view' }) => {
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode') as PageMode | null;

  // Déterminer le mode effectif: priorité au paramètre URL, sinon initialMode
  const effectiveMode = urlMode === 'edit' ? 'edit' : initialMode;

  // Mode view: pas besoin de système d'onglets
  if (effectiveMode === 'view') {
    return <GenericDetailPage config={config} initialMode='view' />;
  }

  // Mode edit/create: utiliser le wrapper avec système d'onglets
  return <StudentFormWrapper initialConfig={config} initialMode={effectiveMode} />;
};
