import { ExperimentationBaner } from '@/components/features/experimentation/ExpBaner';
import { LgConfCard, LgConfSkeleton } from '@/components/ui/ConfCards';
import { Layouts } from '@/components/layout/Layouts';
import { getExperimentations, getActants, getStudents } from '@/services/Items';
import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

export const Experimentations: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [experimentations, setExperimentations] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchAndProcessData = async () => {
      try {
        // Récupérer les expérimentations, actants ET students
        const [experimentations, actants, students] = await Promise.all([getExperimentations(), getActants(), getStudents()]);

        // Créer un map des actants
        const actantMap = new Map();
        actants.forEach((actant: any) => {
          actantMap.set(actant.id, actant);
          actantMap.set(String(actant.id), actant);
          actantMap.set(Number(actant.id), actant);
        });

        // Créer un map des students
        const studentMap = new Map();
        students.forEach((student: any) => {
          studentMap.set(student.id, student);
          studentMap.set(String(student.id), student);
          studentMap.set(Number(student.id), student);
        });

        // Enrichir avec les données complètes des actants
        const experimentationsWithActants = experimentations.map((experimentation: any) => {
          // Traiter le tableau actants pour récupérer les infos complètes
          const enrichedActants = experimentation.actants
            ? experimentation.actants
                .map((actant: any) => {
                  // Si l'actant est déjà une chaîne (nom + organisation), on la garde telle quelle
                  if (typeof actant === 'string' && !/^\d{5}$/.test(actant)) {
                    return { displayName: actant };
                  }
                  const actantId = actant;
                  return (
                    actantMap.get(actantId) ||
                    actantMap.get(Number(actantId)) ||
                    actantMap.get(String(actantId)) ||
                    studentMap.get(actantId) ||
                    studentMap.get(Number(actantId)) ||
                    studentMap.get(String(actantId)) ||
                    null
                  );
                })
                .filter(Boolean)
            : [];

          // Traiter le tableau acteurs pour récupérer les infos complètes (même logique)
          const enrichedActeurs = experimentation.acteurs
            ? experimentation.acteurs
                .map((acteur: any) => {
                  if (typeof acteur === 'string' && !/^\d{5}$/.test(acteur)) {
                    return { displayName: acteur };
                  }
                  const acteurId = acteur;
                  return (
                    actantMap.get(acteurId) ||
                    actantMap.get(Number(acteurId)) ||
                    actantMap.get(String(acteurId)) ||
                    studentMap.get(acteurId) ||
                    studentMap.get(Number(acteurId)) ||
                    studentMap.get(String(acteurId)) ||
                    null
                  );
                })
                .filter(Boolean)
            : [];

          return {
            ...experimentation,
            enrichedActants,
            enrichedActeurs,
            // Pour compatibilité, garder le premier actant comme "actant principal"
            primaryActant: enrichedActants.length > 0 ? enrichedActants[0] : null,
          };
        });

        setExperimentations(experimentationsWithActants);

        console.log('Experimentations originales:', experimentations);
        console.log('Experimentations enrichies:', experimentationsWithActants);
      } catch (error) {
        console.error('Erreur lors du chargement des expérimentations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <ExperimentationBaner/>
      <div className='grid grid-cols-4 w-full gap-25'>
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
          : experimentations.map((item: any, index: number) => (
              <motion.div key={item.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                <LgConfCard {...item} />
              </motion.div>
            ))}
      </div>
    </Layouts>
  );
};
