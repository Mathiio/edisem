import { Layouts } from '@/components/layout/Layouts';
import { PageBanner } from '@/components/ui/PageBanner';
import { UniversityIcon, ExperimentationIcon, SettingsIcon, CitationIcon, SchoolIcon } from '@/components/ui/icons';
import { motion, Variants } from 'framer-motion';
import { ExpCard, ExpCardSkeleton } from '@/components/features/experimentation/ExpCards';
import { useEffect, useState } from 'react';
import { getCourses, getResourcesByCourse, type AllStudentResources, type StudentResourceCard, type Course } from '@/services/StudentSpace';
import { CorpusSection } from '@/components/features/home/CorpusSection';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

// Mapping des types vers les configurations d'affichage
const resourceTypeConfig = {
  experimentation: {
    label: 'Expérimentation',
    icon: ExperimentationIcon,
  },
  tool: {
    label: 'Outil',
    icon: SettingsIcon,
  },
  feedback: {
    label: "Retour d'expérience",
    icon: CitationIcon,
  },
};

interface CourseWithResources extends Course {
  resources: AllStudentResources | null;
  loading: boolean;
}

export const EspaceEtudiant: React.FC = () => {
  const [coursesWithResources, setCoursesWithResources] = useState<CourseWithResources[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [filters, setFilters] = useState<Record<number, 'all' | 'experimentation' | 'tool' | 'feedback'>>({});

  // Charger les cours et leurs ressources
  useEffect(() => {
    const fetchCoursesAndResources = async () => {
      setLoadingCourses(true);
      try {
        const coursesData = await getCourses();
        const courses = Array.isArray(coursesData) ? coursesData : [];

        // Initialiser avec loading state
        const initialState: CourseWithResources[] = courses.map((course) => ({
          ...course,
          resources: null,
          loading: true,
        }));
        setCoursesWithResources(initialState);
        setLoadingCourses(false);

        // Charger les ressources pour chaque cours en parallèle
        const resourcePromises = courses.map(async (course) => {
          try {
            const resources = await getResourcesByCourse(course.id);
            return { courseId: course.id, resources };
          } catch (error) {
            console.error(`Error loading resources for course ${course.id}:`, error);
            return { courseId: course.id, resources: null };
          }
        });

        const results = await Promise.all(resourcePromises);

        setCoursesWithResources((prev) =>
          prev.map((course) => {
            const result = results.find((r) => r.courseId === course.id);
            return {
              ...course,
              resources: result?.resources || null,
              loading: false,
            };
          }),
        );
      } catch (error) {
        console.error('Error loading courses:', error);
        setLoadingCourses(false);
      }
    };

    fetchCoursesAndResources();
  }, []);

  // Obtenir les ressources filtrées d'un cours
  const getFilteredResourcesForCourse = (courseId: number, resources: AllStudentResources | null): StudentResourceCard[] => {
    if (!resources) return [];
    const filter = filters[courseId] || 'all';

    if (filter === 'all') {
      return [...resources.experimentations, ...resources.tools, ...resources.feedbacks].sort((a, b) => new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime());
    }

    switch (filter) {
      case 'experimentation':
        return resources.experimentations;
      case 'tool':
        return resources.tools;
      case 'feedback':
        return resources.feedbacks;
      default:
        return [];
    }
  };

  // Mettre à jour le filtre d'un cours
  const setFilterForCourse = (courseId: number, filter: 'all' | 'experimentation' | 'tool' | 'feedback') => {
    setFilters((prev) => ({ ...prev, [courseId]: filter }));
  };

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <PageBanner
        title={
          <>
            <span>Espace étudiant</span>
          </>
        }
        icon={<UniversityIcon />}
        description="Un espace collaboratif dédié au partage d'expérimentations, de retours d'expérience et d'outils, afin de nourrir une dynamique collective d'apprentissage et d'innovation."
      />

      {/* Sections par cours */}
      {loadingCourses ? (
        <div className='flex flex-col gap-50'>
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className='flex flex-col gap-25'>
              <div className='h-[60px] w-[300px] bg-c3 rounded-20 animate-pulse' />
              <div className='grid grid-cols-4 w-full gap-25'>
                {Array.from({ length: 4 }).map((_, index) => (
                  <ExpCardSkeleton key={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : coursesWithResources.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-50 text-c4'>
          <SchoolIcon size={48} />
          <p className='mt-20 text-18'>Aucun cours disponible</p>
        </div>
      ) : (
        <div className='flex flex-col gap-50'>
          {coursesWithResources.map((course) => {
            const currentFilter = filters[course.id] || 'all';
            const filteredResources = getFilteredResourcesForCourse(course.id, course.resources);
            const hasResources = filteredResources.length > 0;

            return (
              <motion.section key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='flex flex-col gap-50'>
                {/* En-tête de la section cours */}
                <div className='flex justify-between items-start gap-15 h-full'>
                  <div className='flex  items-start gap-15 bg-c2 px-25 py-15 rounded-20 border-2 border-c3 h-full'>
                    <div className='pt-2'>
                      <SchoolIcon size={20} className='text-c5 ' />
                    </div>
                    <div className='flex flex-col gap-10 '>
                      <h2 className='text-20 font-semibold text-c6 max-w-[500px] line-clamp-3 break-words'>{course.title}</h2>
                      <span className='text-c4 text-14'>{[course.code, course.session, course.year].filter(Boolean).join(' • ')}</span>
                    </div>
                  </div>

                  {/* Filtres par type pour ce cours */}
                  <div className='flex gap-15 '>
                    {(['all', 'experimentation', 'tool', 'feedback'] as const).map((type) => {
                      const isActive = currentFilter === type;
                      const Icon = type !== 'all' ? resourceTypeConfig[type].icon : null;
                      const count = (() => {
                        if (!course.resources) return 0;
                        if (type === 'all') return course.resources.total;
                        if (type === 'experimentation') return course.resources.experimentations.length;
                        if (type === 'tool') return course.resources.tools.length;
                        if (type === 'feedback') return course.resources.feedbacks.length;
                        return 0;
                      })();

                      return (
                        <motion.button
                          key={type}
                          onClick={() => setFilterForCourse(course.id, type)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-15 py-10 rounded-8 border-2 transition-all ease-in-out duration-200 flex items-center gap-10
                            ${isActive ? 'shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c4 bg-c2 text-c6' : 'border-c3 text-c5 hover:bg-c2 hover:border-c4'}`}>
                          {Icon && <Icon className='w-[14px] h-[14px]' />}
                          <span className='text-16 font-medium'>{type === 'all' ? 'Tout' : resourceTypeConfig[type].label}</span>
                          <span className='text-14 text-c4 font-light'>{count}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Grille des ressources */}
                <div className='grid grid-cols-4 w-full gap-25'>
                  {course.loading ? (
                    Array.from({ length: 4 }).map((_, index) => <ExpCardSkeleton key={index} />)
                  ) : !hasResources ? (
                    <div className='col-span-4 flex items-center justify-center py-40 text-c4 rounded-20 border-2 border-c3'>
                      <p className='text-16'>Aucune ressource pour ce cours</p>
                    </div>
                  ) : (
                    filteredResources.map((item, index) => (
                      <motion.div key={`${item.type}-${item.id}`} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                        <ExpCard
                          id={String(item.id)}
                          title={item.title}
                          thumbnail={item.thumbnail ? `https://tests.arcanes.ca/omk${item.thumbnail}` : undefined}
                          actants={item.actants?.map((a) => ({
                            id: String(a.id),
                            title: a.title,
                            picture: a.picture ? `https://tests.arcanes.ca/omk${a.picture}` : undefined,
                          }))}
                          type={item.type === 'experimentation' ? 'experimentationStudents' : item.type}
                        />
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}

      <div className='flex flex-col gap-16 justify-center'>
        <div className='flex flex-col gap-8'>
          <h1 className='text-64 text-c6 font-medium flex flex-col items-center text-center'>Ressources pédagogiques</h1>
          <p className='text-c5 text-16 z-[12] flex flex-col items-center text-center'>Découvrez les contenus d'Edisem produits par les chercheurs.</p>
        </div>
        <CorpusSection />
      </div>
    </Layouts>
  );
};
