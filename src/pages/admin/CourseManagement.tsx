import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import { Button } from '@/theme/components/button';
import { Layouts } from '@/components/layout/Layouts';
import { PlusIcon, EditIcon, TrashIcon, UserIcon } from '@/components/ui/icons';
import { getCourses, createCourse, updateCourse, deleteCourse, getCourseStudents, type Course, type CourseFormData, type Student } from '@/services/StudentSpace';

// Sessions disponibles
const SESSIONS = ['Automne', 'Hiver', 'Été'];

// Niveaux d'études (cycles universitaires)
const LEVELS = ['1er cycle', '2e cycle', '3e cycle'];

// Générer les années (année courante + 5 ans avant et après)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => String(currentYear - 5 + i));

interface CourseManagementProps {
  embedded?: boolean; // Si true, n'affiche pas le Layout wrapper
  highlightCourseId?: number | null; // ID du cours à mettre en surbrillance
}

export const CourseManagement: React.FC<CourseManagementProps> = ({ embedded = false, highlightCourseId: propHighlightCourseId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [highlightedCourseId, setHighlightedCourseId] = useState<number | null>(null);
  const [lastHighlightedId, setLastHighlightedId] = useState<number | null>(null);

  // Appliquer le highlight directement sur le DOM (HeroUI ne passe pas les props au tr)
  useEffect(() => {
    const courseIdToHighlight = propHighlightCourseId || highlightedCourseId;

    // Éviter les déclenchements répétés pour le même cours
    if (!courseIdToHighlight || courses.length === 0 || courseIdToHighlight === lastHighlightedId) {
      return;
    }

    setLastHighlightedId(courseIdToHighlight);

    // Délai pour laisser le DOM se rendre après changement d'onglet
    setTimeout(() => {
      const marker = document.getElementById(`course-marker-${courseIdToHighlight}`);
      if (marker) {
        const row = marker.closest('tr');
        if (row) {
          row.style.transition = '0.3s ease-in-out';
          row.style.backgroundColor = '#13111f';
          row.style.outline = '2px solid #ffffff';
          row.style.outlineOffset = '-1px';
          row.style.borderRadius = '8px';
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Animation pulse manuelle
          let pulse = true;
          const interval = setInterval(() => {
            if (row) {
              row.style.backgroundColor = pulse ? '#13111f' : '#201e2d';
              pulse = !pulse;
            }
          }, 500);

          // Nettoyer après 3 secondes
          setTimeout(() => {
            clearInterval(interval);
            if (row) {
              row.style.backgroundColor = '';
              row.style.outline = '';
              row.style.outlineOffset = '';
              row.style.borderRadius = '';
            }
            setLastHighlightedId(null);
          }, 3000);
        }
      }
    }, 200);
  }, [propHighlightCourseId, highlightedCourseId, courses.length, lastHighlightedId]);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    code: '',
    level: '',
    session: '',
    year: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const coursesData = await getCourses();
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      addToast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les cours',
        classNames: { base: 'bg-danger text-white' },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Gestion du highlight depuis l'URL
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId && !loading) {
      const courseId = parseInt(highlightId);
      setHighlightedCourseId(courseId);

      // Scroll vers la ligne après un court délai
      setTimeout(() => {
        const element = document.getElementById(`course-row-${courseId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      // Retirer le highlight après 3 secondes
      setTimeout(() => {
        setHighlightedCourseId(null);
        setSearchParams({});
      }, 3000);
    }
  }, [searchParams, loading, setSearchParams]);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      code: '',
      level: '',
      session: '',
      year: String(currentYear),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      code: course.code || '',
      level: course.level || '',
      session: course.session || '',
      year: course.year || '',
    });
    setIsModalOpen(true);
  };

  const handleViewStudents = async (course: Course) => {
    setViewingCourse(course);
    setIsStudentsModalOpen(true);
    setLoadingStudents(true);

    try {
      const students = await getCourseStudents(course.id);
      setCourseStudents(Array.isArray(students) ? students : []);
    } catch (error: any) {
      console.error('Error loading course students:', error);
      addToast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les étudiants',
        classNames: { base: 'bg-danger text-white' },
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      addToast({
        title: 'Erreur',
        description: 'Le titre du cours est requis',
        classNames: { base: 'bg-danger text-white' },
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        addToast({
          title: 'Succès',
          description: 'Cours mis à jour',
          classNames: { base: 'bg-success text-white' },
        });
      } else {
        await createCourse(formData);
        addToast({
          title: 'Succès',
          description: 'Cours créé',
          classNames: { base: 'bg-success text-white' },
        });
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

  const handleDelete = async (course: Course) => {
    if (!confirm(`Supprimer le cours "${course.title}" ? Les étudiants seront désinscrits.`)) return;

    try {
      await deleteCourse(course.id);
      addToast({
        title: 'Succès',
        description: 'Cours supprimé',
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
            <h1 className='text-28 font-semibold text-c6'>Gestion des Cours</h1>
            <p className='text-14 text-c5 mt-1'>{courses.length} cours</p>
            {/* Bouton de test du highlight - À SUPPRIMER */}
          </div>
          <Button className='bg-action text-selected' startContent={<PlusIcon size={16} />} onPress={handleOpenCreate}>
            Nouveau Cours
          </Button>
        </div>

        {/* Table des cours */}
        <div className='bg-c2 rounded-12 p-20'>
          <Table
            aria-label='Liste des cours'
            classNames={{
              wrapper: 'bg-transparent shadow-none rounded-12',
              th: 'bg-c3 text-c6 h-12 first:rounded-l-8 last:rounded-r-8',
              td: 'text-c6',
            }}>
            <TableHeader>
              <TableColumn>COURS</TableColumn>
              <TableColumn>CODE</TableColumn>
              <TableColumn>NIVEAU</TableColumn>
              <TableColumn>SESSION</TableColumn>
              <TableColumn>ANNÉE</TableColumn>
              <TableColumn>ÉTUDIANTS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent='Aucun cours'>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <span id={`course-marker-${course.id}`} className='hidden' />
                    <div>
                      <p className='font-medium'>{course.title}</p>
                      {course.description && <p className='text-12 text-c4 truncate max-w-[300px]'>{course.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.code ? (
                      <Chip size='sm' variant='flat' className='bg-c3'>
                        {course.code}
                      </Chip>
                    ) : (
                      <span className='text-c4'>-</span>
                    )}
                  </TableCell>
                  <TableCell>{course.level || <span className='text-c4'>-</span>}</TableCell>
                  <TableCell>{course.session || <span className='text-c4'>-</span>}</TableCell>
                  <TableCell>{course.year || <span className='text-c4'>-</span>}</TableCell>
                  <TableCell>
                    {course.studentCount} étudiant{course.studentCount !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleViewStudents(course)}>
                        <UserIcon size={18} />
                      </Button>
                      <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenEdit(course)}>
                        <EditIcon size={18} />
                      </Button>
                      <Button isIconOnly variant='flat' className='bg-danger/20 text-danger' onPress={() => handleDelete(course)}>
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
            <ModalHeader className='text-c6'>{editingCourse ? 'Modifier le cours' : 'Nouveau cours'}</ModalHeader>
            <ModalBody className='gap-4'>
              <Input
                label='Titre du cours'
                placeholder='Introduction à la narratologie'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
                classNames={{
                  inputWrapper: 'bg-c1 border-c3',
                  label: 'text-c5',
                }}
              />

              <Textarea
                label='Description'
                placeholder='Description du cours...'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                classNames={{
                  inputWrapper: 'bg-c1 border-c3',
                  label: 'text-c5',
                }}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Code du cours'
                  placeholder='ART2030'
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  classNames={{
                    inputWrapper: 'bg-c1 border-c3',
                    label: 'text-c5',
                  }}
                />
                <Select
                  label='Niveau'
                  placeholder='Sélectionner un niveau'
                  selectedKeys={formData.level ? [formData.level] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, level: selected || '' });
                  }}
                  classNames={{
                    trigger: 'bg-c1 border-c3',
                    label: 'text-c5',
                  }}>
                  {LEVELS.map((level) => (
                    <SelectItem key={level}>{level}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <Select
                  label='Session'
                  placeholder='Sélectionner une session'
                  selectedKeys={formData.session ? [formData.session] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, session: selected || '' });
                  }}
                  classNames={{
                    trigger: 'bg-c1 border-c3',
                    label: 'text-c5',
                  }}>
                  {SESSIONS.map((session) => (
                    <SelectItem key={session}>{session}</SelectItem>
                  ))}
                </Select>

                <Select
                  label='Année'
                  placeholder='Sélectionner une année'
                  selectedKeys={formData.year ? [formData.year] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, year: selected || '' });
                  }}
                  classNames={{
                    trigger: 'bg-c1 border-c3',
                    label: 'text-c5',
                  }}>
                  {YEARS.map((year) => (
                    <SelectItem key={year}>{year}</SelectItem>
                  ))}
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => setIsModalOpen(false)} className='bg-c3 text-c6'>
                Annuler
              </Button>
              <Button className='bg-action text-selected' onPress={handleSubmit} isLoading={submitting}>
                {editingCourse ? 'Mettre à jour' : 'Créer'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Liste des étudiants */}
        <Modal isOpen={isStudentsModalOpen} onClose={() => setIsStudentsModalOpen(false)} size='lg'>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6'>Étudiants inscrits à "{viewingCourse?.title}"</ModalHeader>
            <ModalBody>
              {loadingStudents ? (
                <div className='flex justify-center py-8'>
                  <Spinner />
                </div>
              ) : courseStudents.length === 0 ? (
                <p className='text-c4 text-center py-8'>Aucun étudiant inscrit à ce cours</p>
              ) : (
                <div className='flex flex-col gap-2 max-h-[400px] overflow-y-auto'>
                  {courseStudents.map((student) => (
                    <div key={student.id} className='flex items-center gap-3 p-3 bg-c3 rounded-8'>
                      {student.picture ? (
                        <img src={student.picture} alt={student.title} className='w-10 h-10 rounded-full object-cover' />
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-c4 flex items-center justify-center text-c6 font-medium'>
                          {student.firstname?.[0]}
                          {student.lastname?.[0]}
                        </div>
                      )}
                      <div className='flex-1'>
                        <p className='text-c6 font-medium'>{student.title}</p>
                        <p className='text-c5 text-12'>{student.mail}</p>
                      </div>
                      {student.studentNumber && (
                        <Chip size='sm' variant='flat' className='bg-c4'>
                          {student.studentNumber}
                        </Chip>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={() => setIsStudentsModalOpen(false)} className='bg-c3 text-c6'>
                Fermer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Wrapper>
  );
};

export default CourseManagement;
