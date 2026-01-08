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

// Type pour les lignes d'import CSV avec statut de doublon
interface ImportStudentRow {
  id: string; // ID unique pour React key
  firstname: string;
  lastname: string;
  email: string;
  studentNumber: string;
  classNumber: string;
  courseCode: string; // Numéro de cours (ex: DES-2004)
  courseId: number | null; // ID du cours trouvé, null si non trouvé
  courseName: string | null; // Nom du cours pour affichage
  selected: boolean;
  isDuplicate: boolean;
  duplicateReason: string | null; // Raison du doublon (email, numéro étudiant, nom)
  isEditing: boolean;
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
  onNavigateToCourse?: (courseId: number) => void; // Callback pour naviguer vers un cours
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ embedded = false, onNavigateToCourse }) => {
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

  // États pour la modal de prévisualisation
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportStudentRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // États pour la sélection multiple (batch actions)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [deletingBatch, setDeletingBatch] = useState(false);

  const loadData = useCallback(async () => {
    console.log('[StudentManagement] loadData called');
    setLoading(true);
    try {
      console.log('[StudentManagement] Fetching students, users and courses...');
      const [studentsData, usersData, coursesData] = await Promise.all([fetchStudents(), fetchOmekaUsers(), getCourses()]);
      console.log('[StudentManagement] Data loaded:', { students: studentsData, users: usersData, courses: coursesData });

      const studentsArray = Array.isArray(studentsData) ? studentsData : [];
      const coursesArray = Array.isArray(coursesData) ? coursesData : [];

      // Charger les cours pour chaque étudiant et lier les utilisateurs Omeka
      const usersArray = Array.isArray(usersData) ? usersData : [];
      const studentsWithCoursesAndUsers = await Promise.all(
        studentsArray.map(async (student) => {
          try {
            const studentCourses = await getStudentCourses(student.id);
            const linkedUser = student.omekaUserId ? usersArray.find((u) => u.id === student.omekaUserId) || null : null;
            return { ...student, courses: Array.isArray(studentCourses) ? studentCourses : [], linkedUser };
          } catch {
            const linkedUser = student.omekaUserId ? usersArray.find((u) => u.id === student.omekaUserId) || null : null;
            return { ...student, courses: [], linkedUser };
          }
        }),
      );

      setStudents(studentsWithCoursesAndUsers);
      setOmekaUsers(Array.isArray(usersData) ? usersData : []);
      setAllCourses(coursesArray);
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

  // Fonctions pour la sélection multiple
  const handleToggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAllStudents = (selected: boolean) => {
    if (selected) {
      setSelectedStudentIds(new Set(students.map((s) => s.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleBatchDelete = async () => {
    if (selectedStudentIds.size === 0) return;

    const count = selectedStudentIds.size;
    if (!confirm(`Supprimer ${count} étudiant${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''} ?`)) return;

    setDeletingBatch(true);
    let success = 0;
    let errors = 0;

    for (const studentId of selectedStudentIds) {
      try {
        await deleteStudent(studentId);
        success++;
      } catch {
        errors++;
      }
    }

    setDeletingBatch(false);
    setSelectedStudentIds(new Set());

    if (errors > 0) {
      addToast({
        title: 'Suppression partielle',
        description: `${success} supprimé(s), ${errors} erreur(s)`,
        classNames: { base: 'bg-warning text-white' },
      });
    } else {
      addToast({
        title: 'Succès',
        description: `${success} étudiant(s) supprimé(s)`,
        classNames: { base: 'bg-success text-white' },
      });
    }

    loadData();
  };

  const handleClearSelection = () => {
    setSelectedStudentIds(new Set());
  };

  const handleDownloadTemplate = () => {
    window.open('/templates/etudiants_template.csv', '_blank');
  };

  // Parser le CSV et détecter les doublons pour prévisualisation
  // Fonction pour parser une ligne CSV en gérant les guillemets
  const parseCSVLine = (line: string, separator: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseCSVForPreview = async (file: File): Promise<ImportStudentRow[]> => {
    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    // Détecter le séparateur (virgule ou point-virgule)
    const firstLine = lines[0] || '';
    const separator = firstLine.includes(';') ? ';' : ',';

    // Skip header
    const dataLines = lines.slice(1);

    // Créer des index pour détecter les doublons avec les étudiants existants
    const existingByEmail = new Map<string, StudentItem>();
    const existingByStudentNumber = new Map<string, StudentItem>();

    students.forEach((student) => {
      if (student.mail) {
        existingByEmail.set(student.mail.toLowerCase().trim(), student);
      }
      if (student.studentNumber) {
        existingByStudentNumber.set(student.studentNumber.trim(), student);
      }
    });

    // Index pour détecter les doublons internes au CSV
    const csvEmails = new Set<string>();
    const csvStudentNumbers = new Set<string>();

    const rows: ImportStudentRow[] = [];

    // Créer un index des cours par code pour recherche rapide
    const coursesByCode = new Map<string, { id: number; title: string }>();
    allCourses.forEach((course) => {
      if (course.code) {
        coursesByCode.set(course.code.toLowerCase().trim(), { id: course.id, title: course.title });
      }
    });

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      // Utiliser le parser CSV qui gère les guillemets
      const parts = parseCSVLine(line, separator);

      // Format CSV: Prenom,Nom,Email,NumeroEtudiant,Cours,,,Université,Nom du Cours,Numéro de cours,Session,Année
      // Index:      0      1   2     3              4     5 6 7         8            9               10      11
      const [firstname, lastname, email, studentNumber] = parts;
      const courseCode = parts[9] || ''; // Numéro de cours (ex: DES-2004)

      // Ignorer les lignes vides
      if (!firstname && !lastname && !email) {
        continue;
      }

      let isDuplicate = false;
      let duplicateReason: string | null = null;

      const emailLower = email?.toLowerCase().trim() || '';
      const studentNumTrimmed = studentNumber?.trim() || '';

      // Vérifier les doublons avec la base existante
      if (emailLower && existingByEmail.has(emailLower)) {
        isDuplicate = true;
        const existing = existingByEmail.get(emailLower)!;
        duplicateReason = `Email existe déjà (${existing.title})`;
      } else if (studentNumTrimmed && existingByStudentNumber.has(studentNumTrimmed)) {
        isDuplicate = true;
        const existing = existingByStudentNumber.get(studentNumTrimmed)!;
        duplicateReason = `N° étudiant existe déjà (${existing.title})`;
      }
      // Vérifier les doublons internes au CSV
      else if (emailLower && csvEmails.has(emailLower)) {
        isDuplicate = true;
        duplicateReason = 'Email en double dans le CSV';
      } else if (studentNumTrimmed && csvStudentNumbers.has(studentNumTrimmed)) {
        isDuplicate = true;
        duplicateReason = 'N° étudiant en double dans le CSV';
      }

      // Ajouter aux index CSV
      if (emailLower) csvEmails.add(emailLower);
      if (studentNumTrimmed) csvStudentNumbers.add(studentNumTrimmed);

      // Trouver le cours par son code
      const courseCodeLower = courseCode.toLowerCase().trim();
      const foundCourse = courseCodeLower ? coursesByCode.get(courseCodeLower) : null;

      rows.push({
        id: `row-${i}-${Date.now()}`,
        firstname: firstname || '',
        lastname: lastname || '',
        email: email || '',
        studentNumber: studentNumber || '',
        classNumber: '',
        courseCode: courseCode,
        courseId: foundCourse?.id || null,
        courseName: foundCourse?.title || null,
        selected: !isDuplicate,
        isDuplicate,
        duplicateReason,
        isEditing: false,
      });
    }

    return rows;
  };

  // Ouvrir la modal de prévisualisation après parsing du CSV
  const handleParseCSV = async () => {
    if (!importFile) return;

    try {
      const rows = await parseCSVForPreview(importFile);

      if (rows.length === 0) {
        addToast({
          title: 'Fichier vide',
          description: 'Aucune donnée valide trouvée dans le fichier CSV',
          classNames: { base: 'bg-warning text-white' },
        });
        return;
      }

      setPreviewRows(rows);
      setIsImportModalOpen(false);
      setIsPreviewModalOpen(true);
    } catch (error: any) {
      addToast({
        title: 'Erreur de lecture',
        description: error.message,
        classNames: { base: 'bg-danger text-white' },
      });
    }
  };

  // Mettre à jour une ligne de prévisualisation
  const handleUpdatePreviewRow = (rowId: string, field: keyof ImportStudentRow, value: string | boolean) => {
    setPreviewRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        const updated = { ...row, [field]: value };

        // Si on modifie l'email ou le numéro étudiant, recalculer le statut de doublon
        if (field === 'email' || field === 'studentNumber') {
          const emailLower = (field === 'email' ? (value as string) : row.email).toLowerCase().trim();
          const studentNum = (field === 'studentNumber' ? (value as string) : row.studentNumber).trim();

          // Vérifier avec les étudiants existants
          const existingByEmail = students.find((s) => s.mail?.toLowerCase().trim() === emailLower);
          const existingByNum = students.find((s) => s.studentNumber?.trim() === studentNum);

          // Vérifier les doublons internes (autres lignes du CSV)
          const otherRows = prev.filter((r) => r.id !== rowId);
          const csvDuplicateEmail = emailLower && otherRows.some((r) => r.email.toLowerCase().trim() === emailLower);
          const csvDuplicateNum = studentNum && otherRows.some((r) => r.studentNumber.trim() === studentNum);

          if (existingByEmail) {
            updated.isDuplicate = true;
            updated.duplicateReason = `Email existe déjà (${existingByEmail.title})`;
          } else if (existingByNum) {
            updated.isDuplicate = true;
            updated.duplicateReason = `N° étudiant existe déjà (${existingByNum.title})`;
          } else if (csvDuplicateEmail) {
            updated.isDuplicate = true;
            updated.duplicateReason = 'Email en double dans le CSV';
          } else if (csvDuplicateNum) {
            updated.isDuplicate = true;
            updated.duplicateReason = 'N° étudiant en double dans le CSV';
          } else {
            updated.isDuplicate = false;
            updated.duplicateReason = null;
          }
        }

        return updated;
      }),
    );
  };

  // Sélectionner/Désélectionner toutes les lignes
  const handleSelectAll = (selected: boolean) => {
    setPreviewRows((prev) => prev.map((row) => ({ ...row, selected })));
  };

  // Sélectionner uniquement les non-doublons
  const handleSelectNonDuplicates = () => {
    setPreviewRows((prev) => prev.map((row) => ({ ...row, selected: !row.isDuplicate })));
  };

  // Confirmer l'import des lignes sélectionnées
  const handleConfirmImport = async () => {
    const selectedRows = previewRows.filter((row) => row.selected);

    if (selectedRows.length === 0) {
      addToast({
        title: 'Aucune sélection',
        description: 'Veuillez sélectionner au moins un étudiant à importer',
        classNames: { base: 'bg-warning text-white' },
      });
      return;
    }

    setImporting(true);
    setImportProgress([]);
    setImportProgress((prev) => [...prev, `${selectedRows.length} étudiant(s) à créer...`]);

    let success = 0;
    let errors = 0;

    let enrolledCount = 0;

    for (const row of selectedRows) {
      if (!row.firstname || !row.lastname || !row.email) {
        setImportProgress((prev) => [...prev, `⚠️ ${row.firstname || '?'} ${row.lastname || '?'}: données manquantes`]);
        errors++;
        continue;
      }

      try {
        const result = await createStudent({
          firstname: row.firstname,
          lastname: row.lastname,
          email: row.email,
          studentNumber: row.studentNumber,
          classNumber: row.classNumber,
          omekaUserId: null,
          createUser: true,
          courseIds: [],
        });

        // Inscrire au cours si un cours a été trouvé
        if (row.courseId && result.studentId) {
          try {
            await enrollStudent(result.studentId, row.courseId);
            setImportProgress((prev) => [...prev, `✓ ${row.firstname} ${row.lastname} créé et inscrit à ${row.courseCode}`]);
            enrolledCount++;
          } catch {
            setImportProgress((prev) => [...prev, `✓ ${row.firstname} ${row.lastname} créé (erreur inscription cours)`]);
          }
        } else {
          setImportProgress((prev) => [...prev, `✓ ${row.firstname} ${row.lastname} créé avec compte Omeka S`]);
        }
        success++;
      } catch (e: any) {
        setImportProgress((prev) => [...prev, `✗ ${row.firstname} ${row.lastname}: ${e.message}`]);
        errors++;
      }
    }

    const summary = [`${success} créé(s)`];
    if (enrolledCount > 0) summary.push(`${enrolledCount} inscrit(s) au cours`);
    if (errors > 0) summary.push(`${errors} erreur(s)`);
    setImportProgress((prev) => [...prev, `--- Terminé: ${summary.join(', ')} ---`]);

    if (success > 0) {
      addToast({
        title: 'Import terminé',
        description: `${success} étudiant(s) créé(s) avec leur compte Omeka S`,
        classNames: { base: 'bg-success text-white' },
      });
      loadData();
    }

    setImporting(false);
  };

  // Fermer la modal de prévisualisation
  const handleClosePreview = () => {
    if (!importing) {
      setIsPreviewModalOpen(false);
      setPreviewRows([]);
      setEditingRowId(null);
      setImportProgress([]);
      setImportFile(null);
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

        {/* Barre d'actions batch */}
        {selectedStudentIds.size > 0 && (
          <div className='bg-c3 rounded-12 p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span className='text-c6 font-medium'>
                {selectedStudentIds.size} étudiant{selectedStudentIds.size > 1 ? 's' : ''} sélectionné{selectedStudentIds.size > 1 ? 's' : ''}
              </span>
              <Button size='sm' variant='flat' className='bg-c4 text-c6' onPress={handleClearSelection}>
                Annuler la sélection
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <Button size='sm' className='bg-danger text-white' startContent={<TrashIcon size={16} />} onPress={handleBatchDelete} isLoading={deletingBatch}>
                Supprimer ({selectedStudentIds.size})
              </Button>
            </div>
          </div>
        )}

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
              <TableColumn width={50}>
                <Checkbox
                  isSelected={students.length > 0 && selectedStudentIds.size === students.length}
                  isIndeterminate={selectedStudentIds.size > 0 && selectedStudentIds.size < students.length}
                  onValueChange={handleSelectAllStudents}
                  size='sm'
                  classNames={{ wrapper: 'before:border-c4' }}
                />
              </TableColumn>
              <TableColumn>ÉTUDIANT</TableColumn>
              <TableColumn>N° ÉTUDIANT</TableColumn>
              <TableColumn>COURS</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>UTILISATEUR OMEKA</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent='Aucun étudiant'>
              {students.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const hasSelection = selectedStudentIds.size > 0;
                return (
                  <TableRow key={student.id} className={isSelected ? 'bg-action/10' : ''}>
                    <TableCell>
                      <Checkbox isSelected={isSelected} onValueChange={() => handleToggleStudentSelection(student.id)} size='sm' classNames={{ wrapper: 'before:border-c4' }} />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar src={student.picture || undefined} name={student.title} size='sm' className='bg-c4' />
                        <span className='font-medium'>{student.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.studentNumber || <span className='text-c4'>-</span>}</TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1 items-center'>
                        {student.courses && student.courses.length > 0 ? (
                          <>
                            {student.courses.slice(0, 2).map((course) => (
                              <span
                                key={course.id}
                                className={
                                  onNavigateToCourse
                                    ? 'text-c6 border-2 border-c4 hover:text-c1 cursor-pointer transition-colors px-4 py-1.5 bg-c3 hover:bg-c4 rounded-8'
                                    : 'text-c6 border-2 border-c4 px-4 py-1.5 bg-c3 rounded-8'
                                }
                                onClick={() => onNavigateToCourse?.(course.id)}>
                                {course.code || course.title.substring(0, 12)}
                              </span>
                            ))}
                            {student.courses.length > 2 && (
                              <Chip size='sm' variant='flat' className='bg-c4 text-c6'>
                                +{student.courses.length - 2}
                              </Chip>
                            )}
                          </>
                        ) : (
                          <Chip size='sm' variant='flat' className='bg-c3 text-c4'>
                            Aucun
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.mail}</TableCell>
                    <TableCell>
                      {student.omekaUserId ? (
                        <div className='flex flex-col gap-1'>
                          <Chip size='sm' color='success' variant='flat'>
                            ID: {student.omekaUserId}
                          </Chip>
                          {student.linkedUser && (
                            <span className='text-c5 text-12'>
                              {student.linkedUser.name} ({student.linkedUser.role})
                            </span>
                          )}
                        </div>
                      ) : (
                        <Chip size='sm' color='warning' variant='flat'>
                          Non lié
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasSelection ? (
                        <span className='text-c4 text-12 italic'>Sélection active</span>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenCourses(student)} title='Gérer les cours'>
                            <SchoolIcon size={18} />
                          </Button>
                          <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenLink(student)} title='Lier utilisateur'>
                            <LinkIcon size={18} />
                          </Button>
                          <Button isIconOnly variant='flat' className='bg-c3' onPress={() => handleOpenEdit(student)} title='Modifier'>
                            <EditIcon size={18} />
                          </Button>
                          <Button isIconOnly variant='flat' className='bg-danger/20 text-danger' onPress={() => handleDelete(student)} title='Supprimer'>
                            <TrashIcon size={18} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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

        {/* Modal Import CSV - Sélection du fichier */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            setImportFile(null);
          }}
          size='lg'>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6'>Importer des étudiants depuis un fichier CSV</ModalHeader>
            <ModalBody className='gap-4'>
              <div className='bg-c3 p-4 rounded-8'>
                <p className='text-c5 text-14 mb-2'>Format attendu (séparateur: virgule ou point-virgule):</p>
                <code className='text-12 text-c6 bg-c1 p-2 rounded block'>Prenom,Nom,Email,NumeroEtudiant,...</code>
                <p className='text-c4 text-12 mt-2'>Téléchargez le template CSV pour avoir le bon format.</p>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-c5 text-14'>Fichier CSV</label>
                <input
                  type='file'
                  accept='.csv'
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className='bg-c1 text-c6 p-3 rounded-8 border border-c3 file:mr-4 file:py-2 file:px-4 file:rounded-8 file:border-0 file:bg-action file:text-selected file:cursor-pointer'
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='flat'
                onPress={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                }}
                className='bg-c3 text-c6'>
                Annuler
              </Button>
              <Button className='bg-action text-selected' onPress={handleParseCSV} isDisabled={!importFile}>
                Prévisualiser
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Prévisualisation Import CSV */}
        <Modal isOpen={isPreviewModalOpen} onClose={handleClosePreview} size='5xl' scrollBehavior='inside'>
          <ModalContent className='bg-c2'>
            <ModalHeader className='text-c6 flex flex-col gap-1'>
              <span>Prévisualisation de l'import</span>
              <span className='text-14 font-normal text-c5'>
                {previewRows.length} étudiant(s) trouvé(s) • {previewRows.filter((r) => r.selected).length} sélectionné(s) •{' '}
                <span className='text-warning'>{previewRows.filter((r) => r.isDuplicate).length} doublon(s)</span>
              </span>
            </ModalHeader>
            <ModalBody className='gap-4'>
              {/* Actions rapides */}
              <div className='flex gap-2 flex-wrap'>
                <Button size='sm' variant='flat' className='bg-c3 text-c6' onPress={() => handleSelectAll(true)}>
                  Tout sélectionner
                </Button>
                <Button size='sm' variant='flat' className='bg-c3 text-c6' onPress={() => handleSelectAll(false)}>
                  Tout désélectionner
                </Button>
                <Button size='sm' variant='flat' className='bg-warning/20 text-warning' onPress={handleSelectNonDuplicates}>
                  Exclure les doublons
                </Button>
              </div>

              {/* Tableau de prévisualisation */}
              <div className='overflow-auto max-h-[50vh]'>
                <Table
                  aria-label='Prévisualisation import CSV'
                  classNames={{
                    wrapper: 'bg-transparent shadow-none',
                    th: 'bg-c3 text-c6 h-10 first:rounded-l-8 last:rounded-r-8',
                    td: 'text-c6 py-2',
                  }}>
                  <TableHeader>
                    <TableColumn width={50}>
                      <Checkbox
                        isSelected={previewRows.length > 0 && previewRows.every((r) => r.selected)}
                        isIndeterminate={previewRows.some((r) => r.selected) && !previewRows.every((r) => r.selected)}
                        onValueChange={(checked) => handleSelectAll(checked)}
                        size='sm'
                        classNames={{ wrapper: 'before:border-c4' }}
                      />
                    </TableColumn>
                    <TableColumn>PRÉNOM</TableColumn>
                    <TableColumn>NOM</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>N° ÉTUDIANT</TableColumn>
                    <TableColumn>COURS</TableColumn>
                    <TableColumn>STATUT</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row) => (
                      <TableRow key={row.id} className={row.isDuplicate ? 'bg-warning/10' : row.selected ? 'bg-success/5' : ''}>
                        <TableCell>
                          <Checkbox
                            isSelected={row.selected}
                            onValueChange={(checked) => handleUpdatePreviewRow(row.id, 'selected', checked)}
                            size='sm'
                            classNames={{ wrapper: 'before:border-c4' }}
                          />
                        </TableCell>
                        <TableCell>
                          {editingRowId === row.id ? (
                            <Input
                              size='sm'
                              value={row.firstname}
                              onChange={(e) => handleUpdatePreviewRow(row.id, 'firstname', e.target.value)}
                              classNames={{ inputWrapper: 'bg-c1 border-c3 h-8', input: 'text-13' }}
                            />
                          ) : (
                            <span className='cursor-pointer hover:text-action' onClick={() => setEditingRowId(row.id)} title='Cliquer pour modifier'>
                              {row.firstname || <span className='text-c4 italic'>Vide</span>}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRowId === row.id ? (
                            <Input
                              size='sm'
                              value={row.lastname}
                              onChange={(e) => handleUpdatePreviewRow(row.id, 'lastname', e.target.value)}
                              classNames={{ inputWrapper: 'bg-c1 border-c3 h-8', input: 'text-13' }}
                            />
                          ) : (
                            <span className='cursor-pointer hover:text-action' onClick={() => setEditingRowId(row.id)} title='Cliquer pour modifier'>
                              {row.lastname || <span className='text-c4 italic'>Vide</span>}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRowId === row.id ? (
                            <Input
                              size='sm'
                              value={row.email}
                              onChange={(e) => handleUpdatePreviewRow(row.id, 'email', e.target.value)}
                              classNames={{ inputWrapper: 'bg-c1 border-c3 h-8', input: 'text-13' }}
                            />
                          ) : (
                            <span className='cursor-pointer hover:text-action' onClick={() => setEditingRowId(row.id)} title='Cliquer pour modifier'>
                              {row.email || <span className='text-c4 italic'>Vide</span>}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRowId === row.id ? (
                            <Input
                              size='sm'
                              value={row.studentNumber}
                              onChange={(e) => handleUpdatePreviewRow(row.id, 'studentNumber', e.target.value)}
                              classNames={{ inputWrapper: 'bg-c1 border-c3 h-8', input: 'text-13' }}
                            />
                          ) : (
                            <span className='cursor-pointer hover:text-action' onClick={() => setEditingRowId(row.id)} title='Cliquer pour modifier'>
                              {row.studentNumber || <span className='text-c4'>-</span>}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.courseId ? (
                            <Chip size='sm' color='primary' variant='flat' className='text-12'>
                              {row.courseCode}
                            </Chip>
                          ) : row.courseCode ? (
                            <Chip size='sm' color='danger' variant='flat' className='text-12' title='Cours non trouvé'>
                              {row.courseCode} ?
                            </Chip>
                          ) : (
                            <span className='text-c4'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.isDuplicate ? (
                            <Chip size='sm' color='warning' variant='flat' className='text-12'>
                              {row.duplicateReason}
                            </Chip>
                          ) : !row.firstname || !row.lastname || !row.email ? (
                            <Chip size='sm' color='danger' variant='flat' className='text-12'>
                              Données manquantes
                            </Chip>
                          ) : (
                            <Chip size='sm' color='success' variant='flat' className='text-12'>
                              Prêt à importer
                            </Chip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Zone de progression (visible pendant l'import) */}
              {importProgress.length > 0 && (
                <div className='bg-c1 p-4 rounded-8 max-h-[150px] overflow-y-auto'>
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

              {/* Info création utilisateur Omeka */}
              <div className='bg-action/10 border border-action/30 p-3 rounded-8'>
                <p className='text-c6 text-13'>Un compte utilisateur Omeka S sera automatiquement créé pour chaque étudiant importé.</p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='flat' onPress={handleClosePreview} className='bg-c3 text-c6' isDisabled={importing}>
                {importProgress.length > 0 ? 'Fermer' : 'Annuler'}
              </Button>
              <Button
                className='bg-action text-selected'
                onPress={handleConfirmImport}
                isLoading={importing}
                isDisabled={importing || previewRows.filter((r) => r.selected).length === 0}>
                Importer {previewRows.filter((r) => r.selected).length} étudiant(s)
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
                <div className='flex flex-col gap-3 max-h-[400px] overflow-y-auto'>
                  {allCourses.map((course) => {
                    const isEnrolled = studentCourseIds.includes(course.id);
                    return (
                      <div
                        key={course.id}
                        onClick={() => !submitting && handleToggleCourse(course.id, isEnrolled)}
                        className={`flex items-center justify-between p-4 rounded-12 transition-all cursor-pointer  ${isEnrolled ? 'bg-action/15 border-2 border-action' : 'bg-c3 border-2 border-transparent hover:border-c4'}`}>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3'>
                            <p className='text-c6 font-semibold text-16'>{course.title}</p>
                            {course.code && (
                              <Chip size='sm' variant='flat' className='bg-c6 text-c1 font-medium rounded-8 px-2'>
                                {course.code}
                              </Chip>
                            )}
                          </div>
                          <p className='text-c5 text-13 mt-1'>{[course.level, course.session, course.year].filter(Boolean).join(' • ') || 'Aucune info'}</p>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-8 border-2 flex items-center justify-center transition-all ${isEnrolled ? 'bg-action border-action' : 'bg-transparent border-c4'}`}>
                          {isEnrolled && (
                            <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                            </svg>
                          )}
                        </div>
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
