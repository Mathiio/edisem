import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  Checkbox,
} from '@heroui/react';
import { ThumbnailIcon, UserIcon } from '@/components/ui/icons';

const API_BASE = '/omk/api/';

interface ResourceItem {
  id: number;
  title: string;
  thumbnailUrl?: string;
  resourceClass?: string;
  description?: string;
  actantName?: string;
  actantPicture?: string;
}

interface ResourceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedResources: ResourceItem[]) => void;
  title: string;
  resourceTemplateIds: number[]; // Support pour plusieurs template IDs
  excludeIds?: number[]; // IDs à exclure de la liste (déjà sélectionnés)
  multiSelect?: boolean;
}

/**
 * Modal réutilisable pour sélectionner des ressources Omeka S
 * Supporte plusieurs resourceTemplateIds et la multi-sélection
 */
export const ResourceSelectionModal: React.FC<ResourceSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  resourceTemplateIds,
  excludeIds = [],
  multiSelect = true,
}) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchFilter, setSearchFilter] = useState('');

  // Charger les ressources quand la modal s'ouvre
  useEffect(() => {
    console.log('[ResourceSelectionModal] useEffect triggered - isOpen:', isOpen, 'resourceTemplateIds:', resourceTemplateIds);
    if (isOpen && resourceTemplateIds.length > 0) {
      console.log('[ResourceSelectionModal] Chargement des ressources...');
      loadResources();
    }
  }, [isOpen, resourceTemplateIds.join(',')]);

  // Reset la sélection quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
      setSearchFilter('');
    }
  }, [isOpen]);

  const loadResources = async () => {
    console.log('[ResourceSelectionModal] loadResources() appelé');
    setLoading(true);
    setError(null);

    try {
      // Charger les ressources pour chaque templateId
      const allResources: ResourceItem[] = [];

      for (const templateId of resourceTemplateIds) {
        const url = `${API_BASE}items?resource_template_id=${templateId}&per_page=100`;
        console.log('[ResourceSelectionModal] Fetching:', url);

        const response = await fetch(url);

        console.log('[ResourceSelectionModal] Response status:', response.status);

        if (!response.ok) {
          console.warn(`[ResourceSelectionModal] Erreur chargement template ${templateId}`, response.status);
          continue;
        }

        const data = await response.json();
        console.log('[ResourceSelectionModal] Nombre d\'items reçus:', data.length);

        // Debug: afficher les données brutes de l'API
        console.log(`[ResourceSelectionModal] Données brutes pour template ${templateId}:`, data);

        const mapped = data.map((item: any) => {
          // Récupérer l'image/thumbnail de différentes sources possibles
          const thumbnailUrl =
            item['thumbnail_display_urls']?.medium ||
            item['thumbnail_display_urls']?.square ||
            item['thumbnail_display_urls']?.large ||
            item['o:thumbnail']?.['@id'] ||
            item['o:primary_media']?.['thumbnail_display_urls']?.medium ||
            null;

          // Récupérer le premier actant s'il existe
          const actant = item['jdc:hasActant']?.[0];
          const actantName = actant?.['display_title'] || actant?.['@value'] || null;

          return {
            id: item['o:id'],
            title: item['dcterms:title']?.[0]?.['@value'] || `Item ${item['o:id']}`,
            thumbnailUrl,
            resourceClass: item['o:resource_class']?.['o:label'] || item['o:resource_template']?.['o:label'],
            description: item['dcterms:description']?.[0]?.['@value']?.substring(0, 100) || null,
            actantName,
            actantPicture: null,
          };
        });

        // Debug: afficher les données mappées
        console.log(`[ResourceSelectionModal] Données mappées pour template ${templateId}:`, mapped);

        allResources.push(...mapped);
      }

      // Dédupliquer par ID
      const uniqueResources = allResources.filter(
        (resource, index, self) => index === self.findIndex((r) => r.id === resource.id)
      );

      setResources(uniqueResources);
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
      setError('Erreur lors du chargement des ressources');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les ressources (exclure celles déjà sélectionnées et appliquer la recherche)
  const availableResources = resources.filter((r) => !excludeIds.includes(r.id));

  const filteredResources = availableResources.filter((r) =>
    r.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!multiSelect) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredResources.map((r) => r.id));
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    const selectedResources = resources.filter((r) => selectedIds.has(r.id));
    onSelect(selectedResources);
    onClose();
  };

  // Composant carte pour une ressource
  const ResourceCard: React.FC<{ item: ResourceItem }> = ({ item }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <div
        onClick={() => handleToggleSelect(item.id)}
        className={`
          relative cursor-pointer rounded-12 border-2 transition-all ease-in-out duration-200
          ${isSelected
            ? 'border-primary bg-primary/10 shadow-[inset_0_0px_30px_rgba(var(--primary-rgb),0.1)]'
            : 'border-c3 hover:border-c4 hover:bg-c2 shadow-[inset_0_0px_30px_rgba(255,255,255,0.04)]'
          }
        `}
      >
        {/* Checkbox en haut à gauche */}
        <div className='absolute top-2 left-2 z-10'>
          <Checkbox
            isSelected={isSelected}
            onValueChange={() => handleToggleSelect(item.id)}
            classNames={{
              wrapper: 'before:border-c4',
            }}
          />
        </div>

        <div className='p-3 flex flex-col gap-2'>
          {/* Thumbnail ou placeholder */}
          <div
            className={`w-full h-[80px] rounded-8 flex justify-center items-center overflow-hidden ${
              item.thumbnailUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-c2 to-c3'
            }`}
            style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})` } : {}}
          >
            {!item.thumbnailUrl && <ThumbnailIcon className='text-c4/30' size={28} />}
          </div>

          {/* Contenu */}
          <div className='flex flex-col gap-1'>
            {/* Titre */}
            <p className='text-13 text-c6 font-medium line-clamp-2 leading-tight'>{item.title}</p>

            {/* Actant ou classe */}
            {(item.actantName || item.resourceClass) && (
              <div className='flex gap-1.5 items-center'>
                <div className='w-5 h-5 flex items-center justify-center bg-c3 rounded-6'>
                  <UserIcon className='text-c4' size={10} />
                </div>
                <p className='text-11 text-c4 font-extralight truncate'>
                  {item.actantName || item.resourceClass}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-c1 border-2 border-c3',
        header: 'border-b border-c3',
        body: 'py-4',
        footer: 'border-t border-c3',
      }}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className='text-c6'>{title}</span>
              <span className="text-sm font-normal text-c5">
                {selectedIds.size} sélectionné(s) sur {availableResources.length} disponibles
              </span>
            </ModalHeader>

            <ModalBody>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                  <span className="ml-3 text-c5">Chargement des ressources...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">{error}</p>
                  <Button size="sm" className="mt-4" onPress={loadResources}>
                    Réessayer
                  </Button>
                </div>
              ) : (
                <>
                  {/* Barre de recherche et boutons */}
                  <div className='flex flex-col sm:flex-row gap-3 mb-4'>
                    <Input
                      placeholder="Rechercher..."
                      value={searchFilter}
                      onValueChange={setSearchFilter}
                      size="sm"
                      className="flex-1"
                      classNames={{
                        inputWrapper: 'bg-c2 border-c3 border-2 hover:bg-c3',
                        input: 'text-c6',
                      }}
                      isClearable
                      onClear={() => setSearchFilter('')}
                    />

                    {/* Boutons de sélection rapide */}
                    {multiSelect && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={handleSelectAll}
                          className='bg-c2 border-2 border-c3 text-c5 hover:bg-c3'
                        >
                          Tout sélectionner
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={handleDeselectAll}
                          className='bg-c2 border-2 border-c3 text-c5 hover:bg-c3'
                        >
                          Tout désélectionner
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Grille de cartes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[450px] overflow-y-auto pr-1">
                    {filteredResources.length === 0 ? (
                      <div className='col-span-full text-center py-12'>
                        <ThumbnailIcon className='text-c4/30 mx-auto mb-3' size={40} />
                        <p className="text-c5 text-sm">Aucune ressource trouvée</p>
                      </div>
                    ) : (
                      filteredResources.map((item) => (
                        <ResourceCard key={item.id} item={item} />
                      ))
                    )}
                  </div>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                onPress={onModalClose}
                className='text-c5 hover:text-c6'
              >
                Annuler
              </Button>
              <Button
                color="primary"
                onPress={handleConfirm}
                isDisabled={selectedIds.size === 0}
                className='bg-primary hover:bg-primary/80'
              >
                Valider ({selectedIds.size})
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ResourceSelectionModal;
