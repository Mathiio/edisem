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
import { LinkIcon, UserIcon, UploadIcon, TrashIcon, EditIcon } from '@/components/ui/icons';
import { getActantsForLogin, linkActantToUser, createOmekaUserForActant, createActantWithUser, deleteActant, type Actant } from '@/services/StudentSpace';

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
  const [selectedActant, setSelectedActant] = useState<Actant | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form pour création d'utilisateur
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('author');

  // Import batch
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchRole, setBatchRole] = useState('author');
  const [batchResults, setBatchResults] = useState<Array<{ name: string; email: string; success: boolean; error?: string }>>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actantToDelete, setActantToDelete] = useState<Actant | null>(null);
  const [deleteUserToo, setDeleteUserToo] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActant, setEditingActant] = useState<Actant | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editName, setEditName] = useState('');
  const [editFirstname, setEditFirstname] = useState('');
  const [editLastname, setEditLastname] = useState('');
  const [saving, setSaving] = useState(false);

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

  // Mode pour la modal de liaison : 'link' ou 'create'
  const [linkMode, setLinkMode] = useState<'link' | 'create'>('link');

  const handleOpenLink = (actant: Actant) => {
    setSelectedActant(actant);
    setSelectedUserId(actant.omekaUserId || null);
    // Pré-remplir les champs de création avec les infos de l'actant
    setNewUserEmail(actant.mail || '');
    setNewUserName(actant.title || `${actant.firstname} ${actant.lastname}`.trim() || '');
    setNewUserRole('author');
    setLinkMode('link');
    setIsLinkModalOpen(true);
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
      setIsLinkModalOpen(false);
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

  // Parse le texte pour extraire nom et email
  // Formats supportés:
  // - "Prénom Nom <email@domain.com>"
  // - "Nom, Prénom <email@domain.com>"
  // - "Prénom Nom email@domain.com <email@domain.com>"
  const parseActantLine = (line: string): { name: string; email: string } | null => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Chercher l'email entre < >
    const emailMatch = trimmed.match(/<([^>]+@[^>]+)>/);
    if (emailMatch) {
      const email = emailMatch[1].trim();
      // Enlever l'email et tout ce qui est après pour garder juste le nom
      let name = trimmed.replace(/<[^>]+>/, '').trim();
      // Nettoyer les emails en double qui peuvent apparaître avant le < >
      name = name.replace(/\S+@\S+/g, '').trim();
      // Si format "Nom, Prénom", inverser
      if (name.includes(',')) {
        const parts = name.split(',').map((p) => p.trim());
        name = `${parts[1]} ${parts[0]}`;
      }
      return { name, email };
    }

    // Sinon chercher un email simple
    const simpleEmailMatch = trimmed.match(/(\S+@\S+)/);
    if (simpleEmailMatch) {
      const email = simpleEmailMatch[1];
      const name = trimmed.replace(email, '').trim();
      return { name: name || email.split('@')[0], email };
    }

    return null;
  };

  // Traiter l'import batch
  const handleBatchImport = async () => {
    const lines = batchInput.split('\n').filter((l) => l.trim());
    const parsed = lines.map(parseActantLine).filter((p): p is { name: string; email: string } => p !== null);

    if (parsed.length === 0) {
      addToast({
        title: 'Erreur',
        description: 'Aucune entrée valide trouvée',
        classNames: { base: 'bg-danger text-white' },
      });
      return;
    }

    setBatchProcessing(true);
    setBatchResults([]);

    const results: Array<{ name: string; email: string; success: boolean; error?: string }> = [];

    for (const entry of parsed) {
      try {
        await createActantWithUser(entry.email, entry.name, batchRole);
        results.push({ ...entry, success: true });
      } catch (error: any) {
        results.push({ ...entry, success: false, error: error.message });
      }
      setBatchResults([...results]);
    }

    setBatchProcessing(false);

    const successCount = results.filter((r) => r.success).length;
    addToast({
      title: 'Import terminé',
      description: `${successCount}/${results.length} actant(s) créé(s) avec succès`,
      classNames: { base: successCount === results.length ? 'bg-success text-white' : 'bg-warning text-white' },
    });

    if (successCount > 0) {
      loadData();
    }
  };

  // Ouvrir la modal d'édition
  const handleOpenEdit = (actant: Actant) => {
    setEditingActant(actant);
    setEditEmail(actant.mail || '');
    setEditName(actant.title || '');
    setEditFirstname(actant.firstname || '');
    setEditLastname(actant.lastname || '');
    setIsEditModalOpen(true);
  };

  // Sauvegarder les modifications de l'actant
  const handleSaveEdit = async () => {
    if (!editingActant) return;

    setSaving(true);
    try {
      const url = `${API_BASE}&action=updateActant&actantId=${editingActant.id}&email=${encodeURIComponent(editEmail)}&name=${encodeURIComponent(editName)}&firstname=${encodeURIComponent(editFirstname)}&lastname=${encodeURIComponent(editLastname)}&json=1`;
      const response = await fetch(url, { method: 'POST' });
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      addToast({
        title: 'Succès',
        description: 'Actant mis à jour',
        classNames: { base: 'bg-success text-white' },
      });
      setIsEditModalOpen(false);
      loadData();
    } catch (error: any) {
      addToast({
        title: 'Erreur',
        description: error.message,
        classNames: { base: 'bg-danger text-white' },
      });
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir la modal de suppression
  const handleOpenDelete = (actant: Actant) => {
    setActantToDelete(actant);
    setDeleteUserToo(false);
    setIsDeleteModalOpen(true);
  };

  // Confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!actantToDelete) return;

    setDeleting(true);
    try {
      await deleteActant(actantToDelete.id, deleteUserToo);
      addToast({
        title: 'Succès',
        description: `Actant "${actantToDelete.title}" supprimé${deleteUserToo ? ' avec son utilisateur' : ''}`,
        classNames: { base: 'bg-success text-white' },
      });
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error: any) {
      addToast({
        title: 'Erreur',
        description: error.message,
        classNames: { base: 'bg-danger text-white' },
      });
    } finally {
      setDeleting(false);
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
          <div className='flex gap-2 items-center'>
            <Chip variant='flat' className='bg-c3 text-c5'>
              <UserIcon size={14} className='mr-1' />
              {omekaUsers.length} utilisateur{omekaUsers.length > 1 ? 's' : ''} Omeka S
            </Chip>
            <Button
              className='bg-action text-selected'
              startContent={<UploadIcon size={16} />}
              onPress={() => {
                setBatchInput('');
                setBatchResults([]);
                setIsBatchModalOpen(true);
              }}>
              Import batch
            </Button>
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
                      <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenEdit(actant)} title="Modifier l'actant">
                        <EditIcon size={18} />
                      </Button>
                      <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenLink(actant)} title='Lier à un utilisateur Omeka S'>
                        <LinkIcon size={18} />
                      </Button>
                      <Button isIconOnly variant='flat' className='bg-danger/20 text-danger' onPress={() => handleOpenDelete(actant)} title='Supprimer'>
                        <TrashIcon size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal Liaison / Création Utilisateur */}
        <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} size='lg'>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6'>
              {selectedActant?.omekaUserId ? 'Modifier la liaison' : 'Lier'} {selectedActant?.title} à un utilisateur Omeka S
            </ModalHeader>
            <ModalBody className='gap-4'>
              {/* Onglets */}
              <div className='flex gap-2 border-b border-c3 pb-2'>
                <button
                  onClick={() => setLinkMode('link')}
                  className={`px-4 py-2 rounded-t-8 text-14 transition-colors ${linkMode === 'link' ? 'bg-action text-selected' : 'bg-c3 text-c5 hover:bg-c4'}`}>
                  Utilisateur existant
                </button>
                <button
                  onClick={() => setLinkMode('create')}
                  className={`px-4 py-2 rounded-t-8 text-14 transition-colors ${linkMode === 'create' ? 'bg-action text-selected' : 'bg-c3 text-c5 hover:bg-c4'}`}>
                  Créer un utilisateur
                </button>
              </div>

              {linkMode === 'link' ? (
                <>
                  <p className='text-c5 text-14'>Sélectionnez l'utilisateur Omeka S à associer à cet actant.</p>
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
                </>
              ) : (
                <>
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
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => setIsLinkModalOpen(false)} className='bg-c3 text-c6'>
                Annuler
              </Button>
              {linkMode === 'link' ? (
                <Button className='bg-action text-selected' onPress={handleLink} isLoading={submitting} isDisabled={!selectedUserId}>
                  Lier
                </Button>
              ) : (
                <Button className='bg-action text-selected' onPress={handleCreateUser} isLoading={submitting} isDisabled={!newUserEmail || !newUserName}>
                  Créer et lier
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Import Batch */}
        <Modal isOpen={isBatchModalOpen} onClose={() => !batchProcessing && setIsBatchModalOpen(false)} size='2xl'>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6'>Import batch d'actants</ModalHeader>
            <ModalBody className='gap-4'>
              <p className='text-c5 text-14'>Collez une liste d'actants avec leurs emails. Chaque ligne créera un actant et un utilisateur Omeka S.</p>
              <div className='bg-c3 rounded-8 p-10'>
                <p className='text-c4 text-12 mb-2'>Formats supportés :</p>
                <code className='text-c5 text-12 block'>Prénom Nom &lt;email@domain.com&gt;</code>
                <code className='text-c5 text-12 block'>Nom, Prénom &lt;email@domain.com&gt;</code>
              </div>
              <textarea
                className='w-full h-[200px] bg-c1 border-2 border-c3 rounded-8 p-10 text-c6 text-14 resize-none focus:outline-none focus:border-action'
                placeholder={`Maxime Girard <maxime.girard@example.com>\nJean-Marc Larrue <jean-marc.larrue@example.com>\nRichert, Fabien <fabien.richert@example.com>`}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                disabled={batchProcessing}
              />
              <Select
                label='Rôle pour tous les utilisateurs'
                selectedKeys={[batchRole]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected) setBatchRole(String(selected));
                }}
                isDisabled={batchProcessing}
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

              {/* Résultats */}
              {batchResults.length > 0 && (
                <div className='flex flex-col gap-2 max-h-[200px] overflow-y-auto'>
                  <p className='text-c5 text-14 font-medium'>Résultats :</p>
                  {batchResults.map((result, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-2 rounded-8 ${result.success ? 'bg-success/20' : 'bg-danger/20'}`}>
                      <div>
                        <p className='text-c6 text-14'>{result.name}</p>
                        <p className='text-c5 text-12'>{result.email}</p>
                      </div>
                      {result.success ? (
                        <Chip size='sm' color='success' variant='flat'>
                          Créé
                        </Chip>
                      ) : (
                        <Chip size='sm' color='danger' variant='flat'>
                          {result.error || 'Erreur'}
                        </Chip>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => setIsBatchModalOpen(false)} className='bg-c3 text-c6' isDisabled={batchProcessing}>
                Fermer
              </Button>
              <Button className='bg-action text-selected' onPress={handleBatchImport} isLoading={batchProcessing} isDisabled={!batchInput.trim() || batchProcessing}>
                Importer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Suppression */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => !deleting && setIsDeleteModalOpen(false)}>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6'>Supprimer l'actant</ModalHeader>
            <ModalBody>
              <p className='text-c5'>
                Êtes-vous sûr de vouloir supprimer l'actant <span className='text-c6 font-medium'>"{actantToDelete?.title}"</span> ?
              </p>
              {actantToDelete?.omekaUserId && (
                <div className='mt-4 p-3 bg-c3 rounded-8'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input type='checkbox' checked={deleteUserToo} onChange={(e) => setDeleteUserToo(e.target.checked)} className='w-4 h-4 accent-action' />
                    <span className='text-c6 text-14'>Supprimer aussi l'utilisateur Omeka S ({actantToDelete.omekaUserName})</span>
                  </label>
                  <p className='text-c4 text-12 mt-2'>L'utilisateur sera supprimé uniquement s'il n'a pas d'autres ressources.</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => setIsDeleteModalOpen(false)} className='bg-c3 text-c6' isDisabled={deleting}>
                Annuler
              </Button>
              <Button className='bg-danger text-white' onPress={handleConfirmDelete} isLoading={deleting}>
                Supprimer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Édition */}
        <Modal isOpen={isEditModalOpen} onClose={() => !saving && setIsEditModalOpen(false)} size='lg'>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6'>Modifier l'actant</ModalHeader>
            <ModalBody className='gap-4'>
              <Input
                label='Nom complet (titre)'
                placeholder='Prénom Nom'
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-c1 border-c3',
                  label: 'text-c5',
                }}
              />
              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Prénom'
                  placeholder='Prénom'
                  value={editFirstname}
                  onChange={(e) => setEditFirstname(e.target.value)}
                  classNames={{
                    inputWrapper: 'bg-c1 border-c3',
                    label: 'text-c5',
                  }}
                />
                <Input
                  label='Nom de famille'
                  placeholder='Nom'
                  value={editLastname}
                  onChange={(e) => setEditLastname(e.target.value)}
                  classNames={{
                    inputWrapper: 'bg-c1 border-c3',
                    label: 'text-c5',
                  }}
                />
              </div>
              <Input
                label='Email'
                placeholder='email@exemple.com'
                type='email'
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-c1 border-c3',
                  label: 'text-c5',
                }}
              />
              {editingActant?.omekaUserId && (
                <p className='text-c4 text-12'>
                  Lié à l'utilisateur Omeka S : {editingActant.omekaUserName} (ID: {editingActant.omekaUserId})
                </p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => setIsEditModalOpen(false)} className='bg-c3 text-c6' isDisabled={saving}>
                Annuler
              </Button>
              <Button className='bg-action text-selected' onPress={handleSaveEdit} isLoading={saving}>
                Enregistrer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Wrapper>
  );
};

export default ActantManagement;
