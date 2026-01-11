import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  addToast,
  Avatar,
  Select,
  SelectItem,
} from '@heroui/react';
import { Button } from '@/theme/components/button';
import { Layouts } from '@/components/layout/Layouts';
import { TrashIcon, EditIcon, ExperimentationIcon, UserIcon } from '@/components/ui/icons';
import { getCourses, type Course, type StudentResourceCard } from '@/services/StudentSpace';

const API_BASE = 'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=StudentSpace';

// Types
interface ResourceWithCourse extends StudentResourceCard {
  courseId: number | null;
  courseTitle: string | null;
}

// Récupérer toutes les ressources avec leur cours associé
async function fetchAllResources(): Promise<ResourceWithCourse[]> {
  const url = `${API_BASE}&action=getAllResourcesAdmin&json=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des ressources');
  }
  return await response.json();
}

// Mettre à jour le cours d'une ressource
async function updateResourceCourse(resourceId: number, courseId: number | null): Promise<{ success: boolean; error?: string }> {
  const url = `${API_BASE}&action=updateResourceCourse&resourceId=${resourceId}&courseId=${courseId ?? ''}&json=1`;
  console.log('[ResourceManagement] updateResourceCourse URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  console.log('[ResourceManagement] updateResourceCourse response:', data);
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Erreur lors de la mise à jour');
  }
  return data;
}

// Composant Wrapper
const Wrapper: React.FC<{ children: React.ReactNode; embedded?: boolean }> = ({ children, embedded }) => {
  if (embedded) {
    return <div className='flex flex-col gap-30'>{children}</div>;
  }
  return <Layouts className='col-span-10 flex flex-col gap-50 z-0 overflow-visible'>{children}</Layouts>;
};

interface ResourceManagementProps {
  embedded?: boolean;
  onNavigateToCourse?: (courseId: number) => void;
}

const ResourceManagement: React.FC<ResourceManagementProps> = ({ embedded = false, onNavigateToCourse }) => {
  const [resources, setResources] = useState<ResourceWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Modal pour changer le cours
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceWithCourse | null>(null);
  const [newCourseId, setNewCourseId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Modal de suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceWithCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les données
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resourcesData, coursesData] = await Promise.all([fetchAllResources(), getCourses()]);
      setResources(resourcesData);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrer les ressources
  const filteredResources = resources.filter((resource) => {
    // Filtre par cours
    if (filterCourse !== 'all') {
      if (filterCourse === 'none' && resource.courseId !== null) return false;
      if (filterCourse === 'teacher' && resource.courseId !== null) return false;
      if (filterCourse !== 'none' && filterCourse !== 'teacher' && String(resource.courseId) !== filterCourse) return false;
    }
    // Filtre par type
    if (filterType !== 'all' && resource.type !== filterType) return false;
    return true;
  });

  // Statistiques
  const stats = {
    total: resources.length,
    experimentations: resources.filter((r) => r.type === 'experimentation').length,
    tools: resources.filter((r) => r.type === 'tool').length,
    feedbacks: resources.filter((r) => r.type === 'feedback').length,
    withCourse: resources.filter((r) => r.courseId !== null).length,
    teacherResources: resources.filter((r) => r.courseId === null).length,
  };

  // Ouvrir la modal de déplacement
  const handleMoveClick = (resource: ResourceWithCourse) => {
    setSelectedResource(resource);
    setNewCourseId(resource.courseId ? String(resource.courseId) : 'teacher');
    setMoveModalOpen(true);
  };

  // Confirmer le déplacement
  const handleConfirmMove = async () => {
    if (!selectedResource) return;

    setSubmitting(true);
    try {
      const courseId = newCourseId === 'teacher' ? null : parseInt(newCourseId);
      await updateResourceCourse(selectedResource.id as number, courseId);

      addToast({
        title: 'Succès',
        description: 'La ressource a été déplacée avec succès',
        color: 'success',
      });

      await loadData();
      setMoveModalOpen(false);
    } catch (error: any) {
      console.error('Error moving resource:', error);
      addToast({
        title: 'Erreur',
        description: error.message || 'Impossible de déplacer la ressource',
        color: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Ouvrir la modal de suppression
  const handleDeleteClick = (resource: ResourceWithCourse) => {
    setResourceToDelete(resource);
    setDeleteModalOpen(true);
  };

  // Confirmer la suppression (soft delete via API PHP)
  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;

    setIsDeleting(true);
    try {
      const url = `${API_BASE}&action=deleteResource&id=${resourceToDelete.id}&json=1`;
      console.log('[ResourceManagement] Delete URL:', url);
      const response = await fetch(url);
      console.log('[ResourceManagement] Delete response status:', response.status);
      const result = await response.json();
      console.log('[ResourceManagement] Delete result:', result);

      if (result.success) {
        addToast({
          title: 'Succès',
          description: 'La ressource a été supprimée',
          color: 'success',
        });
        await loadData();
      } else {
        throw new Error(result.message || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      addToast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer la ressource',
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setResourceToDelete(null);
    }
  };

  // Label du type de ressource
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'experimentation':
        return 'Expérimentation';
      case 'tool':
        return 'Outil';
      case 'feedback':
        return "Retour d'expérience";
      default:
        return type;
    }
  };

  return (
    <Wrapper embedded={embedded}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-28 font-semibold text-c6'>Gestion des Ressources</h1>
          <p className='text-14 text-c5 mt-1'>
            {stats.total} ressource{stats.total > 1 ? 's' : ''} • {stats.withCourse} liée{stats.withCourse > 1 ? 's' : ''} à un cours • {stats.teacherResources} enseignante
            {stats.teacherResources > 1 ? 's' : ''}
          </p>
        </div>
        <div className='flex gap-10 pb-25'>
          <Select
            label='Filtrer par cours'
            selectedKeys={[filterCourse]}
            onSelectionChange={(keys) => setFilterCourse(Array.from(keys)[0] as string)}
            className='max-w-lg'
            classNames={{
              trigger: 'bg-c2 border-2 border-c3 min-w-[200px]',
              label: 'text-c5',
              value: 'text-c6',
            }}>
            {[{ id: 'all', label: 'Tous les cours' }, { id: 'teacher', label: 'Ressources enseignantes' }, ...courses.map((c) => ({ id: String(c.id), label: c.title }))].map(
              (option) => (
                <SelectItem key={option.id} className='text-c6'>
                  {option.label}
                </SelectItem>
              ),
            )}
          </Select>

          <Select
            label='Filtrer par type'
            selectedKeys={[filterType]}
            onSelectionChange={(keys) => setFilterType(Array.from(keys)[0] as string)}
            className='max-w-lg'
            classNames={{
              trigger: 'bg-c2 border-2 border-c3 min-w-[200px]',
              label: 'text-c5',
              value: 'text-c6',
            }}>
            {[
              { id: 'all', label: 'Tous les types' },
              { id: 'experimentation', label: 'Expérimentations' },
              { id: 'tool', label: 'Outils' },
              { id: 'feedback', label: "Retours d'expérience" },
            ].map((option) => (
              <SelectItem key={option.id} className='text-c6'>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Tableau */}
      <div className='bg-c2 rounded-12 p-20'>
        <Table
          aria-label='Tableau des ressources'
          classNames={{
            wrapper: 'bg-transparent shadow-none rounded-12',
            th: 'bg-c3 text-c6 h-12 first:rounded-l-8 last:rounded-r-8',
            td: 'text-c6',
          }}>
          <TableHeader>
            <TableColumn>RESSOURCE</TableColumn>
            <TableColumn>TYPE</TableColumn>
            <TableColumn>COURS</TableColumn>
            <TableColumn>CRÉATEUR(S)</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} loadingContent={<Spinner />} emptyContent='Aucune ressource trouvée'>
            {filteredResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <div className='flex items-center gap-10'>
                    {resource.thumbnail && (
                      <img
                        src={resource.thumbnail.startsWith('http') ? resource.thumbnail : `https://tests.arcanes.ca/omk${resource.thumbnail}`}
                        alt={resource.title}
                        className='w-25 h-25 rounded-[4px] object-cover'
                      />
                    )}
                    <span className='font-medium'>{resource.title}</span>
                  </div>
                </TableCell>
                <TableCell>{getTypeLabel(resource.type)}</TableCell>
                <TableCell>
                  {resource.courseId ? (
                    <span
                      className={
                        onNavigateToCourse ? 'text-c6 border-2 border-c4 hover:text-c1 cursor-pointer transition-colors px-4 py-1.5 bg-c3 hover:bg-c4 rounded-8 ' : 'text-c6'
                      }
                      onClick={() => onNavigateToCourse?.(resource.courseId as number)}>
                      {resource.courseTitle}
                    </span>
                  ) : (
                    <span className='text-c5'>Ressource enseignante</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex flex-col gap-5 max-w-[200px]'>
                    {resource.actants?.slice(0, 2).map((actant, index) => (
                      <div key={index} className='flex items-center gap-4'>
                        <Avatar
                          src={actant.picture ? (actant.picture.startsWith('http') ? actant.picture : `https://tests.arcanes.ca/omk${actant.picture}`) : undefined}
                          fallback={<UserIcon size={14} />}
                          size='sm'
                          className='w-25 h-25 rounded-[4px] flex-shrink-0'
                        />
                        <span className='text-c6 text-14 truncate'>{actant.title}</span>
                      </div>
                    ))}
                    {resource.actants && resource.actants.length > 2 && (
                      <span className='text-c5 text-12'>
                        +{resource.actants.length - 2} autre{resource.actants.length - 2 > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleMoveClick(resource)}>
                      <EditIcon size={18} />
                    </Button>
                    <Button isIconOnly variant='flat' className='bg-danger/20 text-danger' onPress={() => handleDeleteClick(resource)}>
                      <TrashIcon size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Déplacer */}
      <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)} size='md'>
        <ModalContent className='bg-c2'>
          <ModalHeader className='text-c6'>Déplacer la ressource</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-20'>
              <div className='flex items-center gap-10 p-15 bg-c3 rounded-12'>
                {selectedResource?.thumbnail ? (
                  <img
                    src={selectedResource.thumbnail.startsWith('http') ? selectedResource.thumbnail : `https://tests.arcanes.ca/omk${selectedResource.thumbnail}`}
                    alt={selectedResource.title}
                    className='w-12 h-12 rounded-8 object-cover'
                  />
                ) : (
                  <div className='w-12 h-12 rounded-8 bg-c4 flex items-center justify-center'>
                    <ExperimentationIcon size={20} className='text-c5' />
                  </div>
                )}
                <div>
                  <p className='text-c6 font-medium'>{selectedResource?.title}</p>
                  <p className='text-c5 text-12'>{getTypeLabel(selectedResource?.type || '')}</p>
                </div>
              </div>

              <Select
                label='Nouvelle destination'
                selectedKeys={newCourseId ? [newCourseId] : []}
                onSelectionChange={(keys) => setNewCourseId(Array.from(keys)[0] as string)}
                classNames={{
                  trigger: 'bg-c3 border-2 border-c4',
                  label: 'text-c5',
                  value: 'text-c6',
                }}>
                {[
                  { id: 'teacher', label: 'Ressources enseignantes', isTeacher: true },
                  ...courses.map((c) => ({ id: String(c.id), label: `${c.title}${c.code ? ` (${c.code})` : ''}`, isTeacher: false })),
                ].map((option) => (
                  <SelectItem key={option.id} className={option.isTeacher ? 'text-action font-medium' : 'text-c6'}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => setMoveModalOpen(false)} className='bg-c3 text-c6'>
              Annuler
            </Button>
            <Button onPress={handleConfirmMove} isLoading={submitting} className='bg-action text-selected'>
              Déplacer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Suppression */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalContent className='bg-c2'>
          <ModalHeader className='text-c6'>Confirmer la suppression</ModalHeader>
          <ModalBody>
            <p className='text-c5'>
              Êtes-vous sûr de vouloir supprimer la ressource <span className='text-c6 font-medium'>"{resourceToDelete?.title}"</span> ?
            </p>
            <p className='text-c4 text-14 mt-10'>Cette action est irréversible.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => setDeleteModalOpen(false)} className='bg-c3 text-c6'>
              Annuler
            </Button>
            <Button onPress={handleConfirmDelete} isLoading={isDeleting} className='bg-[#FF0000] text-white'>
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Wrapper>
  );
};

export default ResourceManagement;
