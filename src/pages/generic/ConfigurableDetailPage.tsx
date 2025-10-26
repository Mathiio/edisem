import React from 'react';
import { GenericDetailPage } from './GenericDetailPage';
import { GenericDetailPageConfig } from './config';

interface ConfigurableDetailPageProps {
  config: GenericDetailPageConfig;
}

/**
 * Wrapper pour utiliser les configs directement dans les routes
 * sans avoir besoin de créer un fichier page séparé
 *
 * Usage dans App.tsx:
 * <Route path='/conference/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
 */
export const ConfigurableDetailPage: React.FC<ConfigurableDetailPageProps> = ({ config }) => {
  return <GenericDetailPage config={config} />;
};
