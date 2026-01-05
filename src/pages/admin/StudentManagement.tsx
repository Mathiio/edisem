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
  Checkbox,
} from '@heroui/react';
import { Button } from '@/theme/components/button';
import { Layouts } from '@/components/layout/Layouts';
import { PlusIcon, EditIcon, TrashIcon, LinkIcon, ImportIcon, ExportIcon, SchoolIcon } from '@/components/ui/icons';
import { getCourses, getStudentCourses, enrollStudent, unenrollStudent, type Course } from '@/services/StudentSpace';

// Types
interface OmekaUser {
  id: number;
  email: string;
  name: string;
  role: string;
  created: string;
}

interface StudentItem {
  id: number;
  firstname: string;
  lastname: string;
  title: string;
  mail: string;
  studentNumber: string;
  classNumber: string;
  picture: string | null;
  omekaUserId: number | null;
  linkedUser?: OmekaUser | null;
  courses?: Course[]; // Cours auxquels l'étudiant est inscrit
}

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  studentNumber: string;
  classNumber: string;
  omekaUserId: number | null;
  createUser: boolean;
  courseIds: number[]; // Cours à inscrire lors de la création
}

const API_BASE = 'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=StudentSpace';

// Récupérer les étudiants
async function fetchStudents(): Promise<StudentItem[]> {
  const url = `${API_BASE}&action=getStudentsAdmin&json=1`;
  console.log('[StudentManagement] Fetching students from:', url);
  const response = await fetch(url);
  console.log('[StudentManagement] Response status:', response.status);
  if (!response.ok) {
    const text = await response.text();
    console.error('[StudentManagement] Error response:', text);
    throw new Error('Erreur lors de la récupération des étudiants');
  }
  const data = await response.json();
  console.log('[StudentManagement] Students received:', data);
  return data;
}

// Récupérer les utilisateurs Omeka S
async function fetchOmekaUsers(): Promise<OmekaUser[]> {
  const url = `${API_BASE}&action=getOmekaUsers&json=1`;
  console.log('[StudentManagement] Fetching Omeka users from:', url);
  const response = await fetch(url);
  console.log('[StudentManagement] Users response status:', response.status);
  if (!response.ok) {
    const text = await response.text();
    console.error('[StudentManagement] Users error response:', text);
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  const data = await response.json();
  console.log('[StudentManagement] Omeka users received:', data);
  return data;
}

// Créer un étudiant
async function createStudent(data: FormData): Promise<any> {
  // Passer les données dans l'URL car Omeka S ne lit pas le body JSON
  const params = new URLSearchParams({
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    studentNumber: data.studentNumber || '',
    classNumber: data.classNumber || '',
    createUser: data.createUser ? '1' : '0',
  });
  const url = `${API_BASE}&action=createStudent&json=1&${params.toString()}`;
  console.log('[StudentManagement] Creating student:', data);
  console.log('[StudentManagement] GET to:', url);

  const response = await fetch(url);

  console.log('[StudentManagement] Create response status:', response.status);
  const responseText = await response.text();
  console.log('[StudentManagement] Create response text:', responseText);

  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    console.error('[StudentManagement] Failed to parse JSON:', e);
    throw new Error('Réponse invalide du serveur');
  }

  // Afficher les logs de debug
  if (result.debug) {
    console.log('[StudentManagement] Server debug logs:');
    result.debug.forEach((log: string) => console.log('  -', log));
  }
  if (result.userError) {
    console.warn('[StudentManagement] User creation error:', result.userError);
  }

  if (result.error) {
    console.error('[StudentManagement] Server error:', result.error);
    throw new Error(result.error);
  }

  return result;
}

// Mettre à jour un étudiant
async function updateStudent(id: number, data: Partial<FormData>): Promise<any> {
  const response = await fetch(`${API_BASE}&action=updateStudent&id=${id}&json=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la mise à jour');
  }
  return response.json();
}

// Lier un étudiant à un utilisateur Omeka S
async function linkStudentToUser(studentId: number, userId: number): Promise<any> {
  const response = await fetch(`${API_BASE}&action=linkStudentToUser&studentId=${studentId}&userId=${userId}&json=1`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la liaison');
  }
  return response.json();
}

// Supprimer un étudiant
async function deleteStudent(id: number): Promise<any> {
  const response = await fetch(`${API_BASE}&action=deleteStudent&id=${id}&json=1`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la suppression');
  }
  return response.json();
}

interface StudentManagementProps {
  embedded?: boolean; // Si true, n'affiche pas le Layout wrapper
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ embedded = false }) => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [omekaUsers, setOmekaUsers] = useState<OmekaUser[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [linkingStudent, setLinkingStudent] = useState<StudentItem | null>(null);
  const [managingCoursesStudent, setManagingCoursesStudent] = useState<StudentItem | null>(null);
  const [studentCourseIds, setStudentCourseIds] = useState<number[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    email: '',
    studentNumber: '',
    classNumber: '',
    omekaUserId: null,
    createUser: true,
    courseIds: [],
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const loadData = useCallback(async () => {
    console.log('[StudentManagement] loadData called');
    setLoading(true);
    try {
      console.log('[StudentManagement] Fetching students, users and courses...');
      const [studentsData, usersData, coursesData] = await Promise.all([fetchStudents(), fetchOmekaUsers(), getCourses()]);
      console.log('[StudentManagement] Data loaded:', { students: studentsData, users: usersData, courses: coursesData });
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setOmekaUsers(Array.isArray(usersData) ? usersData : []);
      setAllCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error: any) {
      console.error('[StudentManagement] Error loading data:', error);
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

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      studentNumber: '',
      classNumber: '',
      omekaUserId: null,
      createUser: true,
      courseIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: StudentItem) => {
    setEditingStudent(student);
    setFormData({
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.mail,
      studentNumber: student.studentNumber || '',
      classNumber: student.classNumber || '',
      omekaUserId: student.omekaUserId,
      createUser: false,
      courseIds: [], // Non utilisé en mode édition
    });
    setIsModalOpen(true);
  };

  const handleOpenLink = (student: StudentItem) => {
    setLinkingStudent(student);
    setSelectedUserId(student.omekaUserId);
    setIsLinkModalOpen(true);
  };

  const handleOpenCourses = async (student: StudentItem) => {
    setManagingCoursesStudent(student);
    setIsCoursesModalOpen(true);
    setLoadingCourses(true);

    try {
      const courses = await getStudentCourses(student.id);
      setStudentCourseIds(Array.isArray(courses) ? courses.map((c) => c.id) : []);
    } catch (error: any) {
      console.error('Error loading student courses:', error);
      setStudentCourseIds([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleToggleCourse = async (courseId: number, isEnrolled: boolean) => {
    if (!managingCoursesStudent) return;

    setSubmitting(true);
    try {
      if (isEnrolled) {
        await unenrollStudent(managingCoursesStudent.id, courseId);
        setStudentCourseIds((prev) => prev.filter((id) => id !== courseId));
        addToast({
          title: 'Succès',
          description: 'Étudiant désinscrit du cours',
          classNames: { base: 'bg-success text-white' },
        });
      } else {
        await enrollStudent(managingCoursesStudent.id, courseId);
        setStudentCourseIds((prev) => [...prev, courseId]);
        addToast({
          title: 'Succès',
          description: 'Étudiant inscrit au cours',
          classNames: { base: 'bg-success text-white' },
        });
      }
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

  const handleSubmit = async () => {
    if (!formData.firstname || !formData.lastname || !formData.email) {
      addToast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        classNames: { base: 'bg-danger text-white' },
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
        addToast({
          title: 'Succès',
          description: 'Étudiant mis à jour',
          classNames: { base: 'bg-success text-white' },
        });
      } else {
        // Créer l'étudiant
        const result = await createStudent(formData);

        // Inscrire aux cours sélectionnés si l'étudiant a été créé avec succès
        if (result.studentId && formData.courseIds.length > 0) {
          const enrollmentErrors: string[] = [];
          for (const courseId of formData.courseIds) {
            try {
              await enrollStudent(result.studentId, courseId);
            } catch (e: any) {
              enrollmentErrors.push(e.message);
            }
          }

          if (enrollmentErrors.length > 0) {
            addToast({
              title: 'Attention',
              description: `Étudiant créé mais erreur lors de l'inscription à certains cours`,
              classNames: { base: 'bg-warning text-white' },
            });
          } else {
            addToast({
              title: 'Succès',
              description: `Étudiant créé et inscrit à ${formData.courseIds.length} cours`,
              classNames: { base: 'bg-success text-white' },
            });
          }
        } else {
          addToast({
            title: 'Succès',
            description: 'Étudiant créé' + (formData.createUser ? ' avec son compte utilisateur' : ''),
            classNames: { base: 'bg-success text-white' },
          });
        }
      }
      setIsModalOpen(false);
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

  const handleLink = async () => {
    if (!linkingStudent || !selectedUserId) return;

    setSubmitting(true);
    try {
      await linkStudentToUser(linkingStudent.id, selectedUserId);
      addToast({
        title: 'Succès',
        description: "Étudiant lié à l'utilisateur",
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

  const handleDelete = async (student: StudentItem) => {
    if (!confirm(`Supprimer l'étudiant ${student.title} ?`)) return;

    try {
      await deleteStudent(student.id);
      addToast({
        title: 'Succès',
        description: 'Étudiant supprimé',
        classNames: { base: 'bg-success text-white' },
      });
      loadData();
    } catch (error: any) {
      addToast({
        title: 'Erreur',
        description: error.message,
        classNames: { base: 'bg-danger text-white' },
      });
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/templates/etudiants_template.csv', '_blank');
  };

  const handleImportCSV = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportProgress([]);

    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter((line) => line.trim());

      // Skip header
      const dataLines = lines.slice(1);

      setImportProgress((prev) => [...prev, `${dataLines.length} étudiants à importer...`]);

      let success = 0;
      let errors = 0;

      for (const line of dataLines) {
        // Parser CSV avec séparateur point-virgule
        const [firstname, lastname, email, studentNumber, classNumber] = line.split(';').map((s) => s.trim());

        if (!firstname || !lastname || !email) {
          setImportProgress((prev) => [...prev, `⚠️ Ligne ignorée (données manquantes): ${line}`]);
          errors++;
          continue;
        }

        try {
          await createStudent({
            firstname,
            lastname,
            email,
            studentNumber: studentNumber || '',
            classNumber: classNumber || '',
            omekaUserId: null,
            createUser: true,
            courseIds: [], // Import CSV ne supporte pas l'inscription directe aux cours
          });
          setImportProgress((prev) => [...prev, `✓ ${firstname} ${lastname} créé`]);
          success++;
        } catch (e: any) {
          setImportProgress((prev) => [...prev, `✗ ${firstname} ${lastname}: ${e.message}`]);
          errors++;
        }
      }

      setImportProgress((prev) => [...prev, `--- Terminé: ${success} créés, ${errors} erreurs ---`]);

      if (success > 0) {
        addToast({
          title: 'Import terminé',
          description: `${success} étudiant(s) créé(s)`,
          classNames: { base: 'bg-success text-white' },
        });
        loadData();
      }
    } catch (error: any) {
      setImportProgress((prev) => [...prev, `Erreur: ${error.message}`]);
      addToast({
        title: 'Erreur',
        description: error.message,
        classNames: { base: 'bg-danger text-white' },
      });
    } finally {
      setImporting(false);
    }
  };

  // Filtrer les utilisateurs non liés
  const availableUsers = omekaUsers.filter((user) => !students.some((s) => s.omekaUserId === user.id) || user.id === linkingStudent?.omekaUserId);

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
          <h1 className='text-28 font-semibold text-c6'>Gestion des Étudiants</h1>
          <p className='text-14 text-c5 mt-1'>
            {students.length} étudiant{students.length > 1 ? 's' : ''} • {omekaUsers.length} utilisateur{omekaUsers.length > 1 ? 's' : ''} Omeka S
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='flat' className='bg-c3 text-c6' startContent={<ExportIcon size={16} />} onPress={handleDownloadTemplate}>
            Template CSV
          </Button>
          <Button variant='flat' className='bg-c3 text-c6' startContent={<ImportIcon size={16} />} onPress={() => setIsImportModalOpen(true)}>
            Importer CSV
          </Button>
          <Button className='bg-action text-selected' startContent={<PlusIcon size={16} />} onPress={handleOpenCreate}>
            Nouvel Étudiant
          </Button>
        </div>
      </div>

      {/* Table des étudiants */}
      <div className='bg-c2 rounded-12 p-20'>
        <Table
          aria-label='Liste des étudiants'
          classNames={{
            wrapper: 'bg-transparent shadow-none rounded-12',
            th: 'bg-c3 text-c6 h-12 first:rounded-l-8 last:rounded-r-8',
            td: 'text-c6',
          }}>
          <TableHeader>
            <TableColumn>ÉTUDIANT</TableColumn>
            <TableColumn>N° ÉTUDIANT</TableColumn>
            <TableColumn>COURS</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>UTILISATEUR OMEKA</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent='Aucun étudiant'>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Avatar src={student.picture || undefined} name={student.title} size='sm' className='bg-c4' />
                    <span className='font-medium'>{student.title}</span>
                  </div>
                </TableCell>
                <TableCell>{student.studentNumber || <span className='text-c4'>-</span>}</TableCell>
                <TableCell>
                  <Chip size='sm' variant='flat' className='bg-c3 cursor-pointer hover:bg-c4' onClick={() => handleOpenCourses(student)}>
                    <SchoolIcon size={12} className='mr-1' />
                    Gérer
                  </Chip>
                </TableCell>
                <TableCell>{student.mail}</TableCell>
                <TableCell>
                  {student.omekaUserId ? (
                    <Chip size='sm' color='success' variant='flat'>
                      ID: {student.omekaUserId}
                    </Chip>
                  ) : (
                    <Chip size='sm' color='warning' variant='flat'>
                      Non lié
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenLink(student)}>
                      <LinkIcon size={18} />
                    </Button>
                    <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenEdit(student)}>
                      <EditIcon size={18} />
                    </Button>
                    <Button isIconOnly variant='flat' className='bg-danger/20 text-danger' onPress={() => handleDelete(student)}>
                      <TrashIcon size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Création/Édition */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size='lg'>
        <ModalContent className='bg-c2'>
          <ModalHeader className='text-c6'>{editingStudent ? "Modifier l'étudiant" : 'Nouvel étudiant'}</ModalHeader>
          <ModalBody className='gap-4'>
            <div className='grid grid-cols-2 gap-4'>
              <Input
                label='Prénom'
                placeholder='Jean'
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                isRequired
                classNames={{
                  inputWrapper: 'bg-c1 border-c3',
                  label: 'text-c5',
                }}
              />
              <Input
                label='Nom'
                placeholder='Dupont'
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                isRequired
                classNames={{
                  inputWrapper: 'bg-c1 border-c3',
                  label: 'text-c5',
                }}
              />
            </div>
            <Input
              label='Email'
              placeholder='jean.dupont@universite.fr'
              type='email'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              isRequired
              classNames={{
                inputWrapper: 'bg-c1 border-c3',
                label: 'text-c5',
              }}
            />
            <Input
              label='Numéro étudiant'
              placeholder='20231234'
              value={formData.studentNumber}
              onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
              classNames={{
                inputWrapper: 'bg-c1 border-c3',
                label: 'text-c5',
              }}
            />
            {!editingStudent && (
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='createUser'
                  checked={formData.createUser}
                  onChange={(e) => setFormData({ ...formData, createUser: e.target.checked })}
                  className='w-4 h-4'
                />
                <label htmlFor='createUser' className='text-c6 text-14'>
                  Créer automatiquement un compte utilisateur Omeka S
                </label>
              </div>
            )}
            {/* Sélection des cours (uniquement en création) */}
            {!editingStudent && allCourses.length > 0 && (
              <div className='flex flex-col gap-2'>
                <label className='text-c5 text-14'>Inscrire à des cours (optionnel)</label>
                <div className='flex flex-col gap-2 max-h-[150px] overflow-y-auto bg-c1 p-3 rounded-8'>
                  {allCourses.map((course) => {
                    const isSelected = formData.courseIds.includes(course.id);
                    return (
                      <div
                        key={course.id}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, courseIds: formData.courseIds.filter((id) => id !== course.id) });
                          } else {
                            setFormData({ ...formData, courseIds: [...formData.courseIds, course.id] });
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-8 cursor-pointer transition-colors ${
                          isSelected ? 'bg-action/20 border border-action/30' : 'bg-c3 hover:bg-c4'
                        }`}>
                        <div className='flex items-center gap-2'>
                          <Checkbox
                            isSelected={isSelected}
                            onValueChange={() => {
                              if (isSelected) {
                                setFormData({ ...formData, courseIds: formData.courseIds.filter((id) => id !== course.id) });
                              } else {
                                setFormData({ ...formData, courseIds: [...formData.courseIds, course.id] });
                              }
                            }}
                            size='sm'
                            classNames={{ wrapper: 'before:border-c4' }}
                          />
                          <span className='text-c6 text-14'>{course.title}</span>
                          {course.code && (
                            <Chip size='sm' variant='flat' className='bg-c4 text-12'>
                              {course.code}
                            </Chip>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formData.courseIds.length > 0 && (
                  <p className='text-c5 text-12'>
                    {formData.courseIds.length} cours sélectionné{formData.courseIds.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => setIsModalOpen(false)} className='bg-c3 text-c6'>
              Annuler
            </Button>
            <Button className='bg-action text-selected' onPress={handleSubmit} isLoading={submitting}>
              {editingStudent ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Liaison */}
      <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} size='lg'>
        <ModalContent className='bg-c2'>
          <ModalHeader className='text-c6'>Lier {linkingStudent?.title} à un utilisateur</ModalHeader>
          <ModalBody>
            <p className='text-c5 text-14 mb-4'>
              Sélectionnez l'utilisateur Omeka S à associer à cet étudiant. Cela permettra de définir le bon propriétaire lors de la création de ressources.
            </p>
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
                    <Chip size='sm' variant='flat'>
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

      {/* Modal Import CSV */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          if (!importing) {
            setIsImportModalOpen(false);
            setImportFile(null);
            setImportProgress([]);
          }
        }}
        size='xl'>
        <ModalContent className='bg-c2'>
          <ModalHeader className='text-c6'>Importer des étudiants depuis un fichier CSV</ModalHeader>
          <ModalBody className='gap-4'>
            <div className='bg-c3 p-4 rounded-8'>
              <p className='text-c5 text-14 mb-2'>Format attendu (séparateur: point-virgule):</p>
              <code className='text-12 text-c6 bg-c1 p-2 rounded block'>Prenom;Nom;Email;NumeroEtudiant;Classe</code>
              <p className='text-c4 text-12 mt-2'>Téléchargez le template CSV pour avoir le bon format.</p>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-c5 text-14'>Fichier CSV</label>
              <input
                type='file'
                accept='.csv'
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                disabled={importing}
                className='bg-c1 text-c6 p-3 rounded-8 border border-c3 file:mr-4 file:py-2 file:px-4 file:rounded-8 file:border-0 file:bg-action file:text-selected file:cursor-pointer'
              />
            </div>

            {importProgress.length > 0 && (
              <div className='bg-c1 p-4 rounded-8 max-h-[200px] overflow-y-auto'>
                <p className='text-c5 text-12 mb-2 font-medium'>Progression:</p>
                <div className='flex flex-col gap-1'>
                  {importProgress.map((line, idx) => (
                    <p
                      key={idx}
                      className={`text-12 ${line.startsWith('✓') ? 'text-success' : line.startsWith('✗') ? 'text-danger' : line.startsWith('⚠️') ? 'text-warning' : 'text-c5'}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant='flat'
              onPress={() => {
                setIsImportModalOpen(false);
                setImportFile(null);
                setImportProgress([]);
              }}
              className='bg-c3 text-c6'
              isDisabled={importing}>
              {importProgress.length > 0 ? 'Fermer' : 'Annuler'}
            </Button>
            <Button className='bg-action text-selected' onPress={handleImportCSV} isLoading={importing} isDisabled={!importFile || importing}>
              Importer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Gestion des Cours */}
      <Modal isOpen={isCoursesModalOpen} onClose={() => setIsCoursesModalOpen(false)} size='lg'>
        <ModalContent className='bg-c2'>
          <ModalHeader className='text-c6'>Cours de {managingCoursesStudent?.title}</ModalHeader>
          <ModalBody>
            {loadingCourses ? (
              <div className='flex justify-center py-8'>
                <Spinner />
              </div>
            ) : allCourses.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-c4 mb-4'>Aucun cours disponible</p>
                <Button variant='flat' className='bg-c3 text-c6' onPress={() => (window.location.href = '/admin/cours')}>
                  Créer un cours
                </Button>
              </div>
            ) : (
              <div className='flex flex-col gap-2 max-h-[400px] overflow-y-auto'>
                {allCourses.map((course) => {
                  const isEnrolled = studentCourseIds.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      className={`flex items-center justify-between p-3 rounded-8 transition-colors ${isEnrolled ? 'bg-action/10 border border-action/30' : 'bg-c3'}`}>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <p className='text-c6 font-medium'>{course.title}</p>
                          {course.code && (
                            <Chip size='sm' variant='flat' className='bg-c4'>
                              {course.code}
                            </Chip>
                          )}
                        </div>
                        <p className='text-c5 text-12'>{[course.level, course.session, course.year].filter(Boolean).join(' • ') || 'Aucune info'}</p>
                      </div>
                      <Checkbox
                        isSelected={isEnrolled}
                        onValueChange={() => handleToggleCourse(course.id, isEnrolled)}
                        isDisabled={submitting}
                        classNames={{
                          wrapper: 'before:border-c4',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            <p className='text-c4 text-12 mt-4'>
              {studentCourseIds.length} cours sélectionné{studentCourseIds.length !== 1 ? 's' : ''}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onPress={() => setIsCoursesModalOpen(false)} className='bg-c3 text-c6'>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </div>
    </Wrapper>
  );
};

export default StudentManagement;
