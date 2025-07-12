import React from 'react';
import { addToast, Button, Checkbox, cn, Divider } from '@heroui/react';
import { Input } from '@heroui/input';
import { useState } from 'react';
import { GeneratedImage } from '@/pages/visualisation';

import { ShareIcon } from '@/components/utils/icons';
import Omk from '@/components/features/database/CreateModal';

const API_URL = 'https://edisem.arcanes.ca/omk/api/';
const API_KEY = import.meta.env.VITE_API_KEY;
const IDENT = 'NUO2yCjiugeH7XbqwUcKskhE8kXg0rUj';

export const omkInstance = new Omk({
  api: API_URL,
  key: API_KEY,
  ident: IDENT,
  vocabs: ['dcterms', 'oa'],
});

omkInstance.init();

const STORAGE_KEY = 'filterGroups';

interface ExportPopupProps {
  generatedImage: GeneratedImage | null;
  handleExportClick: () => Promise<GeneratedImage>;
  exportEnabled: boolean; // ajout de la prop
}

export const ExportPopup: React.FC<ExportPopupProps> = ({ handleExportClick, generatedImage, exportEnabled }) => {
  const userString = localStorage.getItem('user');
  const user: any | null = userString ? JSON.parse(userString) : null;

  if (!user) {
    return null; // Empêche le rendu du composant proprement
  }

  const [, setCopyConfirmation] = useState<string | null>(null);
  const [shouldExportImage, setShouldExportImage] = useState(true);
  const [, setIsExporting] = useState(false);
  const [title, setTitle] = useState('');

  const handleExport = async (): Promise<void> => {
    if (!title.trim()) {
      setCopyConfirmation("Veuillez entrer un titre pour l'export");
      return;
    }

    setIsExporting(true);

    try {
      const image = await handleExportClick();
      if (!shouldExportImage || !image) {
        setCopyConfirmation('Export sans image sélectionnée');
        setIsExporting(false);
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');

      const savedFilters = localStorage.getItem(STORAGE_KEY);
      const configObject = {
        titre: title,
        config: savedFilters ? JSON.parse(savedFilters) : [],
      };

      console.log(configObject.config);

      if (shouldExportImage && image) {
        const link = document.createElement('a');
        link.download = `visualisation_${timestamp}.png`;
        link.href = image.dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Données à envoyer à l'API
      const rawData = {
        '@type': ['o:Item', 'schema:ResearchProject'], // Type d'annotation
        'o:resource_class': {
          '@id': 'https://tests.arcanes.ca/omk/api/resource_classes/826',
          'o:id': 826,
        },
        'o:resource_template': {
          '@id': 'https://tests.arcanes.ca/omk/api/resource_templates/102',
          'o:id': 102,
        },
        'dcterms:title': [
          {
            type: 'literal',
            property_id: 1,
            property_label: 'Title',
            is_public: true,
            '@value': title,
          },
        ],
        'schema:creator': [
          {
            type: 'resource',
            property_id: 2,
            property_label: 'Creator',
            is_public: true,
            value_resource_id: user.id, // Utilisateur actuel comme contributeur
            value_resource_name: 'items',
          },
        ],
        'schema:codeRepository': [
          {
            type: 'literal',
            property_id: 551,
            property_label: 'codeRepository',
            is_public: true,
            '@value': JSON.stringify(configObject.config),
          },
        ],
      };

      // Envoi de la requête à l'API
      const response = await omkInstance.createItem(rawData);
      console.log('Export effectué:', response);

      setCopyConfirmation('Export réussi !');
    } catch (e) {
      setCopyConfirmation("Erreur lors de l'exportation de l'image");
    }

    setIsExporting(false);
    setTimeout(() => setCopyConfirmation(null), 3000);
  };

  const handleCopyConfig = () => {
    const savedFilters = localStorage.getItem(STORAGE_KEY);
    const configToCopy = savedFilters || 'Aucune configuration trouvée';

    navigator.clipboard
      .writeText(configToCopy)
      .then(() => {
        // Optionnel: Afficher un message de confirmation si la copie a réussi
      })
      .catch((error) => {
        console.error('Erreur lors de la copie:', error);
        alert('Erreur lors de la copie');
      });
  };

  return (
    <div className='w-full flex flex-col gap-4 h-full justify-between'>
      <div className='flex flex-col gap-4'>
        <div className='text-14 flex justify-start leading-[150%] w-full gap-2 rounded-0 text-c6 bg-transparent'>
          Exporter une recherche
        </div>
        <Divider />

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size='lg'
          placeholder='Titre de la recherche...'
          className='focus:bg-c3 bg-c3 h-[50px] text-c6'
          classNames={{
            inputWrapper: 'bg-c3 !bg-c3 h-full',
            base: 'rounded-8 h-full ',
            innerWrapper: 'focus:bg-c3 bg-c3 h-full',
          }}
        />

        <Checkbox
          id='export-image-checkbox'
          isSelected={shouldExportImage}
          onValueChange={setShouldExportImage}
          radius='sm'
          color='secondary'
          classNames={{ wrapper: 'w-[16px] h-[16px]', icon: 'w-[10px] h-[10px]' }}>
          Exporter une image de la vue
        </Checkbox>
      </div>
      {generatedImage && (
        <div className='flex-1 flex flex-col aspect-video overflow-hidden rounded-b-8'>
          <div className='text-c6 text-12'>Prévisualisation :</div>
          <img
            src={generatedImage.dataUrl}
            alt='Aperçu de la visualisation'
            className='flex-1 w-full h-full object-cover mt-2 rounded-8'
          />
        </div>
      )}

      <div className='flex flex-row justify-between'>
        <div className='flex justify-end gap-2 mt-4 h-[30px]'>
          <Button
            size='md'
            className='text-16 h-auto px-10 py-5 rounded-8 text-c6 hover:text-c6 gap-2 bg-c2 hover:bg-c3 transition-all ease-in-out duration-200'
            onClick={handleCopyConfig}
            onPress={() => {
              addToast({
                title: 'Configuration copié',
                classNames: {
                  base: cn(['text-c6', 'mb-4']),
                  icon: 'w-6 h-6 fill-current text-c6',
                },
                severity: 'success',
              });
            }}>
            <ShareIcon size={12} />
            Copier la configuration
          </Button>
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          <Button
            className='text-16 h-auto px-10 py-5 rounded-8 text-selected gap-2 bg-action transition-all ease-in-out duration-200 disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed'
            color='primary'
            onClick={() => {
              const exportPromise = handleExport();
              addToast({
                promise: exportPromise,
                title: 'Exportation en cours...',
                classNames: {
                  base: cn(['text-c6', 'mb-4']),
                  icon: 'w-6 h-6 fill-current text-c6',
                },
                severity: 'success',
              });
            }}
            disabled={!exportEnabled || !title.trim()}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};
