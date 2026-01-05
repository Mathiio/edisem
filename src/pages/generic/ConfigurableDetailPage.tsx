import React from 'react';
import { GenericDetailPage } from './GenericDetailPage';
import { GenericDetailPageConfig, PageMode } from './config';

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
 */
export const ConfigurableDetailPage: React.FC<ConfigurableDetailPageProps> = ({ config, initialMode = 'view' }) => {
  return <GenericDetailPage config={config} initialMode={initialMode} />;
};
