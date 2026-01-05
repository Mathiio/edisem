import { Layouts } from '@/components/layout/Layouts';
import { PageBanner } from '@/components/ui/PageBanner';
import { motion, Variants } from 'framer-motion';
import { ExpCard, ExpCardSkeleton } from '@/components/features/experimentation/ExpCards';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getExperimentationsStudents } from '@/services/Items';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, addToast } from '@heroui/react';
import { ExperimentationIcon, UniversityIcon, TrashIcon, PlusIcon } from '@/components/ui/icons';
import { useNavigate } from 'react-router-dom';
import { experimentationStudentConfigSimplified } from '@/pages/generic/config/experimentationStudentConfig';
import { feedbackStudentConfigSimplified } from '@/pages/generic/config/feedbackStudentConfig';
import { toolStudentConfigSimplified } from '@/pages/generic/config/toolStudentConfig';
import { useAuth } from '@/hooks/useAuth';
import type { Key } from 'react';
import { Button } from '@/theme/components/button';

const API_URL = 'https://tests.arcanes.ca/omk/api';
const API_KEY = import.meta.env.VITE_API_KEY;
const API_IDENT = 'NUO2yCjiugeH7XbqwUcKskhE8kXg0rUj';

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
      const allExperimentations = await getExperimentationsStudents();

      // Récupérer l'ID de l'utilisateur connecté depuis le localStorage
      const userId = localStorage.getItem('userId');

      // Filtrer les expérimentations où l'utilisateur fait partie des actants
      const filteredExperimentations = allExperimentations.filter((experimentation: any) => {
        if (!userId) return false;

        // Vérifier si l'utilisateur est dans les actants de l'expérimentation
        return experimentation.actants?.some((actant: any) => {
          // Comparer l'ID de l'actant avec l'ID de l'utilisateur
          return String(actant.id) === String(userId);
        });
      });

      setExperimentationsStudents(filteredExperimentations);
    } catch (error) {
      console.error('Error loading experimentationsStudents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperimentations();
  }, [fetchExperimentations]);

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

  // Handler pour confirmer la suppression
  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/items/${itemToDelete.id}?key_identity=${API_IDENT}&key_credential=${API_KEY}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast({
          title: 'Succès',
          description: 'La ressource a été supprimée avec succès.',
          color: 'success',
        });
        // Rafraîchir la liste
        await fetchExperimentations();
      } else if (response.status === 404) {
        addToast({
          title: 'Ressource introuvable',
          description: "Cette ressource n'existe plus ou a déjà été supprimée.",
          color: 'warning',
        });
        // Rafraîchir la liste
        await fetchExperimentations();
      } else {
        const errorData = await response.json().catch(() => ({}));
        addToast({
          title: 'Erreur',
          description: errorData.message || 'Une erreur est survenue lors de la suppression.',
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

      <div className='flex justify-center w-full'>
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
              if (config) navigate(config.route);
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
      </div>
      <div className='flex flex-col gap-8 justify-center'>
        <h1 className='text-64 text-c6 font-medium flex flex-col items-center text-center'>Mes ressources</h1>
        <div className='grid grid-cols-4 w-full gap-25'>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <ExpCardSkeleton key={index} />)
            : experimentationsStudents.map((item: any, index: number) => (
                <motion.div key={item.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                  <ExpCard {...item} type='experimentationStudents' showActions onEdit={handleEdit} onDelete={handleDeleteClick} />
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
