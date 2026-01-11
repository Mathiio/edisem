import { Layouts } from '@/components/layout/Layouts';
import { PageBanner } from '@/components/ui/PageBanner';
import { motion, Variants } from 'framer-motion';
import { ExpCard, ExpCardSkeleton } from '@/components/features/experimentation/ExpCards';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getAllStudentResources, getStudentCourses, getCourses, type StudentResourceCard, type Course } from '@/services/StudentSpace';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, addToast, Select, SelectItem } from '@heroui/react';
import { ExperimentationIcon, UniversityIcon, TrashIcon, PlusIcon, WarningIcon } from '@/components/ui/icons';
import { useNavigate } from 'react-router-dom';
import { experimentationStudentConfigSimplified } from '@/pages/generic/config/experimentationStudentConfig';
import { feedbackStudentConfigSimplified } from '@/pages/generic/config/feedbackStudentConfig';
import { toolStudentConfigSimplified } from '@/pages/generic/config/toolStudentConfig';
import { useAuth } from '@/hooks/useAuth';
import type { Key } from 'react';
import { Button } from '@/theme/components/button';

const API_BASE = 'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=StudentSpace';

// Registre des configs créables avec leurs routes et icônes
const createableConfigs = [
  {
    config: experimentationStudentConfigSimplified,
    route: '/add-resource/experimentation',
    icon: ExperimentationIcon,
  },
  {
    config: toolStudentConfigSimplified,
    route: '/add-resource/outil',
    icon: UniversityIcon,
  },
  {
    config: feedbackStudentConfigSimplified,
    route: '/add-resource/retour-experience',
    icon: UniversityIcon,
  },
];

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

export const MonEspace: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [experimentationsStudents, setExperimentationsStudents] = useState<any[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // États pour la gestion des cours
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Option spéciale pour les ressources enseignantes (sans cours)
  const TEACHER_RESOURCES_OPTION = 'teacher-resources';

  // Vérifier si l'utilisateur est un actant
  const isActant = userData?.type === 'actant';

  // Pré-sélectionner "Ressources enseignantes" pour les actants
  useEffect(() => {
    if (isActant) {
      setSelectedCourseId(TEACHER_RESOURCES_OPTION);
    }
  }, [isActant]);

  // Vérifier si l'utilisateur peut créer des ressources
  const canCreate = useMemo(() => {
    if (isActant) return true; // Les actants peuvent toujours créer
    return courses.length > 0; // Les étudiants doivent avoir au moins un cours
  }, [isActant, courses.length]);

  // Informations utilisateur dérivées (kept for future use)
  const _fullName = useMemo(() => {
    if (userData?.firstname && userData?.lastname) {
      return `${userData.firstname} ${userData.lastname}`;
    }
    return userData?.firstname || userData?.lastname || 'Utilisateur';
  }, [userData?.firstname, userData?.lastname]);

  const _userTypeLabel = useMemo(() => {
    switch (userData?.type) {
      case 'actant':
        return 'Actant';
      case 'student':
        return 'Étudiant';
      default:
        return 'Membre';
    }
  }, [userData?.type]);
  void _fullName;
  void _userTypeLabel;

  // Style identique au ProfilDropdown
  const dropdownButtonClass =
    'hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 flex flex-row rounded-8 border-2 border-c3 items-center justify-center px-15 py-10 text-16 gap-10 text-c6 transition-all ease-in-out duration-200';

  const fetchExperimentations = useCallback(async () => {
    try {
      setLoading(true);
      const allResources = await getAllStudentResources();

      // Récupérer l'ID de l'utilisateur connecté depuis le localStorage
      const userId = localStorage.getItem('userId');

      // Combiner toutes les ressources (expérimentations, outils, feedbacks)
      const allItems: StudentResourceCard[] = [...allResources.experimentations, ...allResources.tools, ...allResources.feedbacks];

      // Filtrer les ressources où l'utilisateur fait partie des actants
      const filteredResources = allItems.filter((resource) => {
        if (!userId) return false;

        // Vérifier si l'utilisateur est dans les actants de la ressource
        return resource.actants?.some((actant) => {
          // Comparer l'ID de l'actant avec l'ID de l'utilisateur
          return String(actant.id) === String(userId);
        });
      });

      // Trier par date de création (plus récent en premier)
      filteredResources.sort((a, b) => new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime());

      setExperimentationsStudents(filteredResources);
    } catch (error) {
      console.error('Error loading student resources:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperimentations();
  }, [fetchExperimentations]);

  // Charger les cours de l'utilisateur
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const userId = localStorage.getItem('userId');

        if (isActant) {
          // Les actants voient tous les cours
          const allCourses = await getCourses();
          console.log('[MonEspace] Actant - allCourses:', allCourses);
          const coursesArray = Array.isArray(allCourses) ? allCourses : [];
          console.log('[MonEspace] Setting courses:', coursesArray.length, 'courses');
          setCourses(coursesArray);
        } else if (userId) {
          // Les étudiants ne voient que leurs cours
          const studentCourses = await getStudentCourses(parseInt(userId));
          setCourses(Array.isArray(studentCourses) ? studentCourses : []);

          // Si un seul cours, le sélectionner automatiquement
          if (studentCourses.length === 1) {
            setSelectedCourseId(studentCourses[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, [isActant]);

  // Handler pour créer une ressource avec le cours sélectionné
  const handleCreateResource = useCallback(
    (route: string) => {
      // Pour les actants, une sélection est obligatoire (cours ou ressources enseignantes)
      if (isActant && !selectedCourseId) {
        addToast({
          title: 'Sélection requise',
          description: 'Veuillez sélectionner un cours ou "Ressources enseignantes" avant de créer une ressource.',
          color: 'warning',
        });
        return;
      }

      // Déterminer le courseId à utiliser
      // Si "Ressources enseignantes" est sélectionné, pas de courseId
      const courseId = selectedCourseId === TEACHER_RESOURCES_OPTION ? null : selectedCourseId || (courses.length === 1 ? courses[0].id : null);

      // Naviguer avec le courseId en query param (ou sans pour ressources enseignantes)
      navigate(`${route}${courseId ? `?courseId=${courseId}` : ''}`);
    },
    [selectedCourseId, courses, isActant, navigate, TEACHER_RESOURCES_OPTION],
  );

  // Handler pour modifier une ressource - navigue vers la page de détail en mode édition
  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/espace-etudiant/experimentation/${id}?mode=edit`);
    },
    [navigate],
  );

  // Handler pour ouvrir la modal de suppression
  const handleDeleteClick = useCallback(
    (id: string) => {
      const item = experimentationsStudents.find((exp) => exp.id === id);
      if (item) {
        setItemToDelete({ id, title: item.title || 'Sans titre' });
        setDeleteModalOpen(true);
      }
    },
    [experimentationsStudents],
  );

  // Handler pour confirmer la suppression (soft delete via API PHP)
  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}&action=deleteResource&id=${itemToDelete.id}&json=1`);

      const result = await response.json();

      if (result.success) {
        addToast({
          title: 'Succès',
          description: 'La ressource a été supprimée avec succès.',
          color: 'success',
        });
        await fetchExperimentations();
      } else {
        addToast({
          title: 'Erreur',
          description: result.message || 'Une erreur est survenue lors de la suppression.',
          color: 'danger',
        });
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      addToast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression.',
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, fetchExperimentations]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <PageBanner
        title={
          <>
            <span>Mon espace</span>
            <span>ma communauté</span>
          </>
        }
        icon={<UniversityIcon />}
        description='Un espace personnel pensé pour centraliser vos activités, suivre vos démarches et accéder facilement aux ressources qui vous accompagnent tout au long de votre parcours.'
      />

      {/* Section Profil Utilisateur */}
      {/*<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='flex justify-center'>
        <div className='flex items-center gap-15 bg-c2 border-2 border-c3 rounded-12 px-20 py-15'>
          <Avatar src={userData?.picture || undefined} fallback={<UserIcon className='text-c4' size={20} />} className='w-[50px] h-[50px] border-2 border-c3 bg-c3' radius='md' />
          <div className='flex flex-col'>
            <span className='text-18 font-medium text-c6'>{fullName}</span>
            <span className='text-14 text-c5'>
              {userTypeLabel} · {experimentationsStudents.length} ressource{experimentationsStudents.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </motion.div>*/}

      {/* Avertissement si étudiant sans cours */}
      {!isActant && !loadingCourses && courses.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='flex justify-center w-full'>
          <div className='flex items-center gap-15 bg-warning/10 border-2 border-warning/30 rounded-12 px-20 py-15 max-w-xl'>
            <WarningIcon size={24} className='text-warning flex-shrink-0' />
            <div className='flex flex-col gap-5'>
              <span className='text-c6 font-medium'>Inscription requise</span>
              <span className='text-c5 text-14'>Vous devez être inscrit à au moins un cours pour créer des ressources. Contactez votre enseignant pour vous inscrire.</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sélecteur de cours et bouton d'ajout */}
      <div className='flex justify-center w-full gap-15 items-end'>
        {/* Sélecteur de cours pour les actants ou étudiants multi-cours */}
        {canCreate && (isActant || courses.length > 1) && (
          <Select
            label='Destination'
            placeholder='Sélectionnez une destination'
            selectedKeys={selectedCourseId ? [String(selectedCourseId)] : []}
            onSelectionChange={(keys) => {
              const id = Array.from(keys)[0];
              if (id === TEACHER_RESOURCES_OPTION) {
                setSelectedCourseId(TEACHER_RESOURCES_OPTION);
              } else {
                setSelectedCourseId(id ? parseInt(String(id)) : null);
              }
            }}
            isLoading={loadingCourses}
            isRequired={isActant}
            className='max-w-xs'
            classNames={{
              trigger: 'bg-c2 border-2 border-c3 hover:bg-c3',
              label: 'text-c5',
              value: 'text-c6',
              popoverContent: 'bg-c2 border-2 border-c3',
            }}>
            {(() => {
              const options = [
                // Option Ressources enseignantes pour les actants
                ...(isActant
                  ? [
                      {
                        id: TEACHER_RESOURCES_OPTION,
                        label: 'Ressources enseignantes',
                        isTeacher: true,
                      },
                    ]
                  : []),
                // Liste des cours
                ...courses.map((course) => ({
                  id: String(course.id),
                  label: `${course.title}${course.code ? ` (${course.code})` : ''}`,
                  isTeacher: false,
                })),
              ];
              console.log('[MonEspace] Select options:', options);
              return options;
            })().map((option) => (
              <SelectItem key={option.id} className={option.isTeacher ? 'text-action font-medium hover:bg-c3' : 'text-c6 hover:bg-c3'}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        )}

        {/* Dropdown d'ajout de ressource */}
        {canCreate && (
          <Dropdown>
            <DropdownTrigger>
              <div className={dropdownButtonClass}>
                Ajouter une ressource
                <PlusIcon className='text-c6 rotate-90' size={14} />
              </div>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Actions d'ajout"
              className='bg-c2 rounded-20 border-2 border-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] p-4 min-w-[200px]'
              onAction={(key: Key) => {
                const config = createableConfigs.find((c) => String(c.config.templateId) === String(key));
                if (config) handleCreateResource(config.route);
              }}>
              {createableConfigs.map(({ config, icon: Icon }) => (
                <DropdownItem
                  key={String(config.templateId)}
                  className='hover:bg-c3 text-c6 px-3 py-2 rounded-8 transition-all duration-200'
                  startContent={<Icon size={16} className='text-c5' />}>
                  {config.resourceType}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
      <div className='flex flex-col gap-8 justify-center'>
        <h1 className='text-64 text-c6 font-medium flex flex-col items-center text-center'>Mes ressources</h1>
        <div className='grid grid-cols-4 w-full gap-25'>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <ExpCardSkeleton key={index} />)
            : experimentationsStudents.map((item, index) => (
                <motion.div key={`${item.type}-${item.id}`} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                  <ExpCard
                    id={String(item.id)}
                    title={item.title}
                    thumbnail={item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `https://tests.arcanes.ca/omk${item.thumbnail}`) : undefined}
                    actants={item.actants?.map((a: { id: number | string; title: string; picture: string | null }) => ({
                      id: String(a.id),
                      title: a.title,
                      picture: a.picture ? (a.picture.startsWith('http') ? a.picture : `https://tests.arcanes.ca/omk${a.picture}`) : undefined,
                    }))}
                    type={item.type === 'experimentation' ? 'experimentationStudents' : item.type}
                    showActions
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </motion.div>
              ))}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        classNames={{ base: 'bg-c1 border-2 border-c3', header: 'border-b border-c3', body: 'py-6', footer: 'border-t border-c3' }}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-10 bg-red-500/20'>
                <TrashIcon size={20} className='text-[#FF0000]' />
              </div>
              <span className='text-c6'>Confirmer la suppression</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='flex flex-col justify-center gap-[30px]'>
              <p className='text-c5'>
                Êtes-vous sûr de vouloir supprimer la ressource <span className='text-c6 font-medium'>"{itemToDelete?.title}"</span> ?
              </p>
              <p className='text-c4 text-14'>Cette action est irréversible.</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setDeleteModalOpen(false)} className='text-c5 hover:text-c6 min-h'>
              Annuler
            </Button>
            <Button onPress={handleConfirmDelete} isLoading={isDeleting} className='bg-[#FF0000]/70 hover:bg-[#FF0000]/90'>
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layouts>
  );
};
