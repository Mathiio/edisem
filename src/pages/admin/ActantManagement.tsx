import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
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
  Chip,
  Avatar,
  Select,
  SelectItem,
} from '@heroui/react';
import { Button } from '@/theme/components/button';
import { Layouts } from '@/components/layout/Layouts';
import { LinkIcon, UserIcon, PlusIcon } from '@/components/ui/icons';
import { getActantsForLogin, linkActantToUser, createOmekaUserForActant, type Actant } from '@/services/StudentSpace';

// Types
interface OmekaUser {
  id: number;
  email: string;
  name: string;
  role: string;
  created: string;
}

const API_BASE = 'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=StudentSpace';

// Récupérer les utilisateurs Omeka S
async function fetchOmekaUsers(): Promise<OmekaUser[]> {
  const url = `${API_BASE}&action=getOmekaUsers&json=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  return await response.json();
}

interface ActantManagementProps {
  embedded?: boolean;
}

export const ActantManagement: React.FC<ActantManagementProps> = ({ embedded = false }) => {
  const [actants, setActants] = useState<Actant[]>([]);
  const [omekaUsers, setOmekaUsers] = useState<OmekaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [selectedActant, setSelectedActant] = useState<Actant | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form pour création d'utilisateur
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('author');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [actantsData, usersData] = await Promise.all([getActantsForLogin(), fetchOmekaUsers()]);
      setActants(Array.isArray(actantsData) ? actantsData : []);
      setOmekaUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error: any) {
      console.error('[ActantManagement] Error loading data:', error);
      addToast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les données',
        classNames: { base: 'bg-danger text-white' },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenLink = (actant: Actant) => {
    setSelectedActant(actant);
    setSelectedUserId(actant.omekaUserId || null);
    setIsLinkModalOpen(true);
  };

  const handleOpenCreateUser = (actant: Actant) => {
    setSelectedActant(actant);
    // Pré-remplir avec les infos de l'actant
    setNewUserEmail(actant.mail || '');
    setNewUserName(actant.title || `${actant.firstname} ${actant.lastname}`.trim() || '');
    setNewUserRole('author');
    setIsCreateUserModalOpen(true);
  };

  const handleLink = async () => {
    if (!selectedActant || !selectedUserId) return;

    setSubmitting(true);
    try {
      await linkActantToUser(selectedActant.id, selectedUserId);
      addToast({
        title: 'Succès',
        description: "Actant lié à l'utilisateur Omeka S",
        classNames: { base: 'bg-success text-white' },
      });
      setIsLinkModalOpen(false);
      loadData();
    } catch (error: any) {
      addToast({
        title: 'Erreur',
        description: error.message,
        classNames: { base: 'bg-danger text-white' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async () => {
    if (!selectedActant || !newUserEmail || !newUserName) {
      addToast({
        title: 'Erreur',
        description: 'Email et nom requis',
        classNames: { base: 'bg-danger text-white' },
      });
      return;
    }

    setSubmitting(true);
    try {
      await createOmekaUserForActant(selectedActant.id, newUserEmail, newUserName, newUserRole);
      addToast({
        title: 'Succès',
        description: "Utilisateur Omeka S créé et lié à l'actant",
        classNames: { base: 'bg-success text-white' },
      });
      setIsCreateUserModalOpen(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('author');
      loadData();
    } catch (error: any) {
      addToast({
        title: 'Erreur',
        description: error.message,
        classNames: { base: 'bg-danger text-white' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrer les utilisateurs non liés pour la modal de liaison
  const availableUsers = omekaUsers.filter((user) => !actants.some((a) => a.omekaUserId === user.id) || user.id === selectedActant?.omekaUserId);

  // Compter les actants liés/non liés
  const linkedCount = actants.filter((a) => a.omekaUserId).length;
  const unlinkedCount = actants.length - linkedCount;

  const Wrapper = embedded ? React.Fragment : Layouts;
  const wrapperProps = embedded ? {} : { className: 'flex flex-col col-span-10 gap-25' };

  if (loading) {
    return (
      <Wrapper {...wrapperProps}>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Spinner size='lg' />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper {...wrapperProps}>
      <div className={embedded ? 'flex flex-col gap-6' : ''}>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-28 font-semibold text-c6'>Gestion des Actants</h1>
            <p className='text-14 text-c5 mt-1'>
              {actants.length} actant{actants.length > 1 ? 's' : ''} (template 72) | {linkedCount} lié{linkedCount > 1 ? 's' : ''} | {unlinkedCount} non lié
              {unlinkedCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className='flex gap-2'>
            <Chip variant='flat' className='bg-c3 text-c5'>
              <UserIcon size={14} className='mr-1' />
              {omekaUsers.length} utilisateur{omekaUsers.length > 1 ? 's' : ''} Omeka S
            </Chip>
          </div>
        </div>

        {/* Info box */}
        <div className='bg-action/10 border-2 border-action/30 rounded-12 p-15'>
          <p className='text-c6 text-14'>
            Les actants sont les enseignants, chercheurs et contributeurs (items template 72). Pour qu'un actant puisse créer des ressources avec son propre compte, il doit être
            lié à un utilisateur Omeka S. Vous pouvez lier un actant à un utilisateur existant ou créer un nouvel utilisateur.
          </p>
        </div>

        {/* Table des actants */}
        <div className='bg-c2 rounded-12 p-20'>
          <Table
            aria-label='Liste des actants'
            classNames={{
              wrapper: 'bg-transparent shadow-none rounded-12',
              th: 'bg-c3 text-c6 h-12 first:rounded-l-8 last:rounded-r-8',
              td: 'text-c6',
            }}>
            <TableHeader>
              <TableColumn>ACTANT</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>UTILISATEUR OMEKA S</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent='Aucun actant trouvé'>
              {actants.map((actant) => (
                <TableRow key={actant.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar src={actant.picture || undefined} name={actant.title} size='sm' className='bg-c4' />
                      <div className='flex flex-col'>
                        <span className='font-medium'>{actant.title || `${actant.firstname} ${actant.lastname}`.trim() || 'Sans nom'}</span>
                        <span className='text-c4 text-12'>Item #{actant.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{actant.mail || <span className='text-c4'>-</span>}</TableCell>
                  <TableCell>
                    {actant.omekaUserId ? (
                      <div className='flex flex-col gap-1'>
                        <Chip size='sm' color='success' variant='flat'>
                          ID: {actant.omekaUserId}
                        </Chip>
                        <span className='text-c5 text-12'>
                          {actant.omekaUserName} ({actant.omekaUserRole})
                        </span>
                      </div>
                    ) : (
                      <Chip size='sm' color='warning' variant='flat'>
                        Non lié
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenLink(actant)} title='Lier à un utilisateur existant'>
                        <LinkIcon size={18} />
                      </Button>
                      {!actant.omekaUserId && (
                        <Button isIconOnly variant='flat' className='bg-action/20 text-action' onPress={() => handleOpenCreateUser(actant)} title='Créer un utilisateur Omeka S'>
                          <PlusIcon size={18} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal Liaison */}
        <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} size='lg'>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6'>Lier {selectedActant?.title} à un utilisateur Omeka S</ModalHeader>
            <ModalBody>
              <p className='text-c5 text-14 mb-4'>Sélectionnez l'utilisateur Omeka S à associer à cet actant. Cela mettra à jour l'email de l'actant et permettra la connexion.</p>
              <div className='flex flex-col gap-2 max-h-[300px] overflow-y-auto'>
                {availableUsers.length === 0 ? (
                  <p className='text-c4 text-center py-4'>Aucun utilisateur disponible</p>
                ) : (
                  availableUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`flex items-center justify-between p-3 rounded-8 cursor-pointer transition-colors ${
                        selectedUserId === user.id ? 'bg-action/20 border-2 border-action' : 'bg-c3 hover:bg-c4'
                      }`}>
                      <div>
                        <p className='text-c6 font-medium'>{user.name}</p>
                        <p className='text-c5 text-12'>{user.email}</p>
                      </div>
                      <Chip size='sm' variant='flat' className={user.role === 'admin' || user.role === 'global_admin' ? 'bg-action/20 text-action' : 'bg-c3'}>
                        {user.role}
                      </Chip>
                    </div>
                  ))
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => setIsLinkModalOpen(false)} className='bg-c3 text-c6'>
                Annuler
              </Button>
              <Button className='bg-action text-selected' onPress={handleLink} isLoading={submitting} isDisabled={!selectedUserId}>
                Lier
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Création Utilisateur */}
        <Modal isOpen={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} size='lg'>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6'>Créer un utilisateur pour {selectedActant?.title}</ModalHeader>
            <ModalBody className='gap-4'>
              <p className='text-c5 text-14'>Créez un nouvel utilisateur Omeka S qui sera automatiquement lié à cet actant.</p>
              <Input
                label='Email'
                placeholder='email@exemple.com'
                type='email'
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                isRequired
                classNames={{
                  inputWrapper: 'bg-c1 border-c3',
                  label: 'text-c5',
                }}
              />
              <Input
                label='Nom complet'
                placeholder='Prénom Nom'
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                isRequired
                classNames={{
                  inputWrapper: 'bg-c1 border-c3',
                  label: 'text-c5',
                }}
              />
              <Select
                label='Rôle'
                selectedKeys={[newUserRole]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected) setNewUserRole(String(selected));
                }}
                classNames={{
                  trigger: 'bg-c1 border-c3',
                  label: 'text-c5',
                  value: 'text-c6',
                  popoverContent: 'bg-c2 border-c3',
                }}>
                <SelectItem key='author' className='text-c6'>
                  Auteur (author)
                </SelectItem>
                <SelectItem key='editor' className='text-c6'>
                  Éditeur (editor)
                </SelectItem>
                <SelectItem key='admin' className='text-c6'>
                  Administrateur (admin)
                </SelectItem>
              </Select>
              <p className='text-c4 text-12'>Un mot de passe temporaire sera généré. L'utilisateur devra le réinitialiser via Omeka S.</p>
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => setIsCreateUserModalOpen(false)} className='bg-c3 text-c6'>
                Annuler
              </Button>
              <Button className='bg-action text-selected' onPress={handleCreateUser} isLoading={submitting} isDisabled={!newUserEmail || !newUserName}>
                Créer et lier
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Wrapper>
  );
};

export default ActantManagement;
