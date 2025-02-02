import React, { useRef } from 'react';
import { Button, Checkbox, Divider, Snippet } from '@nextui-org/react';
import { Input } from '@nextui-org/input';
import { useState } from 'react';
import { GeneratedImage } from '@/pages/visualisation';
import { FilterGroup } from './FilterPopup';

const STORAGE_KEY = 'filterGroups';

const getInitialFilterGroups = (): FilterGroup[] => {
  const savedFilters = localStorage.getItem(STORAGE_KEY);
  if (savedFilters) {
    try {
      return JSON.parse(savedFilters);
    } catch (e) {
      console.error('Error parsing saved filters:', e);
    }
  }
  return [
    {
      name: 'Groupe 1',
      isExpanded: true,
      itemType: '',
      conditions: [],
    },
  ];
};

interface ExportPopupProps {
  generatedImage: GeneratedImage | null;
  handleExportClick: () => void;
}

export const ExportPopup: React.FC<ExportPopupProps> = ({ handleExportClick, generatedImage }) => {
  const [copyConfirmation, setCopyConfirmation] = useState<string | null>(null);
  const [shouldExportImage, setShouldExportImage] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const inputTitle = useRef<HTMLInputElement | null>(null);

  const handleExport = async () => {
    const title = inputTitle.current?.value.trim();
    if (!title) {
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

      // Extraire la configuration des filtres sauvegardés
      const savedFilters = localStorage.getItem(STORAGE_KEY);
      const configObject = {
        titre: title,
        config: savedFilters ? JSON.parse(savedFilters) : [], // Garder la configuration sous forme d'objet
      };

      // Vous pouvez maintenant utiliser ou exporter l'objet configObject
      console.log(configObject);

      // Export de l'image si nécessaire
      if (shouldExportImage && image) {
        const link = document.createElement('a');
        link.download = `visualisation_${timestamp}.png`;
        link.href = image.dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

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
        <div className='text-14 flex justify-start leading-[150%] w-full gap-2 rounded-0 text-default-700 bg-transparent'>
          Exporter une recherche
        </div>
        <Divider />

        <Input
          ref={inputTitle}
          size='lg'
          placeholder='Titre de la recherche...'
          className='focus:bg-default-200 bg-default-200 h-full'
          classNames={{
            inputWrapper: 'bg-default-200 !bg-default-200 h-full',
            base: 'rounded-8 h-full',
            innerWrapper: 'focus:bg-default-200 bg-default-200 h-full',
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
          <div className='text-default-500 text-12'>Prévisualisation :</div>
          <img
            src={generatedImage.dataUrl}
            alt='Aperçu de la visualisation'
            className='flex-1 w-full h-full object-cover mt-2 rounded-8'
          />
        </div>
      )}

      <div className='flex flex-row justify-between'>
        <div className='flex justify-end gap-2 mt-4'>
          <Snippet
            tooltipProps={{
              color: 'foreground',
              content: 'Copier',
              disableAnimation: true,
              placement: 'top',
              closeDelay: 0,
            }}
            onCopy={handleCopyConfig}
            classNames={{ content: '!font-Inter' }}
            className='text-14 font-Inter p-0 bg-default-100'
            symbol=''>
            Copier la configuration
          </Snippet>
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          <Button className='px-10 py-5 rounded-8 bg-default-action text-default-selected' onClick={handleExport}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};
