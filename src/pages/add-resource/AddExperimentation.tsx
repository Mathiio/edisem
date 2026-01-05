import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToast } from '@heroui/react';
import { experimentationStudentConfig } from '@/pages/generic/config/experimentationStudentConfig';
import { Layouts } from '@/components/layout/Layouts';
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';
import { ExperimentationForm } from '@/components/features/forms/ExperimentationForm';
import Omk from '@/services/Omk';

/**
 * Page de création d'une nouvelle expérimentation
 * Utilise un formulaire dédié pour la création
 */
const AddExperimentation: React.FC = () => {
  const navigate = useNavigate();
  const omkRef = useRef<Omk | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser Omk une seule fois
  useEffect(() => {
    if (!omkRef.current) {
      console.log('🚀 Initializing Omk...');

      const pa = {
        mail: 'erwan.tbd@gmail.com',
        api: 'https://edisem.arcanes.ca/omk/api/',
        ident: 'NUO2yCjiugeH7XbqwUcKskhE8kXg0rUj',
        key: import.meta.env.VITE_API_KEY,
      };

      const omk = new Omk(pa);
      omkRef.current = omk;
      omk.init();

      // Marquer comme initialisé après un délai
      setTimeout(() => {
        console.log('✅ Omk initialized');
        setIsInitialized(true);
      }, 2000);
    }
  }, []);

  // Gestion de la sauvegarde
  const handleSave = useCallback(async (data: any) => {
    try {
      console.log('💾 Saving experimentation:', data);

      const omk = omkRef.current;
      if (!omk) {
        throw new Error('Omk non initialisé');
      }

      // Vérifier si Omk est vraiment initialisé
      if (!omk.props || omk.props.length === 0) {
        console.warn('⚠️ Omk props not loaded yet, retrying in 1s...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Construire l'objet de données pour Omeka S
      const itemData: Record<string, any> = {
        'o:resource_template': experimentationStudentConfig.resourceTemplateId,
        'o:resource_class': 'schema:CreativeWork',
      };

      // Mapper les données du formulaire vers le format Omeka S
      if (data.title) {
        itemData['dcterms:title'] = data.title;
      }
      if (data.description) {
        itemData['dcterms:description'] = data.description;
      }
      if (data.abstract) {
        itemData['dcterms:abstract'] = data.abstract;
      }
      if (data.percentage !== undefined) {
        itemData['fup8:percentage'] = data.percentage;
      }
      if (data.status) {
        itemData['schema:status'] = data.status;
      }
      if (data.date) {
        itemData['dcterms:date'] = data.date;
      }
      if (data.url) {
        itemData['schema:url'] = data.url;
      }

      console.log('Data to send to Omeka:', itemData);

      // Créer l'item via Omeka S API
      const createPromise = new Promise((resolve, reject) => {
        omk.createItem(itemData, (result) => {
          console.log('Omeka create result:', result);
          if (result && result['o:id']) {
            resolve(result);
          } else if (result && result.errors) {
            reject(new Error(JSON.stringify(result.errors)));
          } else if (result && result.error) {
            reject(new Error(result.error));
          } else {
            reject(new Error('Échec de la création de l\'expérimentation'));
          }
        });
      });

      // Afficher un toast pendant la création
      addToast({
        title: 'Création en cours',
        description: 'Création de l\'expérimentation...',
        promise: createPromise,
      });

      const result: any = await createPromise;

      // Toast de succès
      addToast({
        title: 'Expérimentation créée',
        description: 'Votre expérimentation a été enregistrée avec succès.',
        color: 'success',
      });

      // Rediriger vers la page de l'expérimentation créée
      navigate(`/espace-etudiant/experimentation/${result['o:id']}`);
    } catch (error) {
      console.error('Error saving experimentation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';

      addToast({
        title: 'Erreur',
        description: `Échec de la création : ${errorMessage}`,
        color: 'danger',
      });

      throw error;
    }
  }, [navigate]);

  // Gestion de l'annulation
  const handleCancel = useCallback(() => {
    // Retourner à la page précédente ou à l'espace étudiant
    navigate('/espace-etudiant');
  }, [navigate]);

  // Afficher un message de chargement si Omk n'est pas encore initialisé
  if (!isInitialized) {
    return (
      <Layouts className='col-span-10'>
        <div className='mb-25'>
          <DynamicBreadcrumbs itemTitle='Nouvelle Expérimentation' underline='hover' />
        </div>
        <div className='flex items-center justify-center p-50'>
          <div className='flex flex-col items-center gap-20'>
            <div className='w-16 h-16 border-4 border-action border-t-transparent rounded-full animate-spin'></div>
            <p className='text-c5 text-16'>Chargement du formulaire...</p>
          </div>
        </div>
      </Layouts>
    );
  }

  return (
    <Layouts className='col-span-10'>
      <div className='mb-25'>
        <DynamicBreadcrumbs itemTitle='Nouvelle Expérimentation' underline='hover' />
      </div>

      <ExperimentationForm
        onSubmit={handleSave}
        onCancel={handleCancel}
      />
    </Layouts>
  );
};

export default AddExperimentation;
