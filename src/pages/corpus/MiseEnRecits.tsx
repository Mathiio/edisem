import { LgConfCard, LgConfSkeleton } from '@/components/features/home/ConfCards';

import { Layouts } from '@/components/layout/Layouts';
import { getRecitIas, getActants, getStudents } from '@/lib/Items';
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

export const MiseEnRecits: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [oeuvres, setOeuvres] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchAndProcessData = async () => {
      try {
        // Récupérer les œuvres (RecitIas), actants ET students
        const [recitIas, actants, students] = await Promise.all([getRecitIas(), getActants(), getStudents()]);

        // Vérifier si recitIas est un tableau valide
        if (!Array.isArray(recitIas) || recitIas.length === 0) {
          setLoading(false);
          return;
        }

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
        const oeuvresWithActants = recitIas.map((oeuvre: any) => {
          // Traiter le tableau actants
          let enrichedActants = [];

          if (oeuvre.actants && Array.isArray(oeuvre.actants)) {
            enrichedActants = oeuvre.actants
              .map((actant: any) => {
                // Si l'actant est déjà une chaîne (nom + organisation), on la garde telle quelle
                if (typeof actant === 'string' && !/^\d{5}$/.test(actant)) {
                  return { displayName: actant };
                }

                // Sinon, c'est un ID numérique, on cherche dans les maps
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
              .filter(Boolean);
          }

          return {
            ...oeuvre,
            enrichedActants, // Nouveau tableau avec les infos complètes
            // Pour compatibilité, garder le premier actant comme "actant principal"
            primaryActant: enrichedActants.length > 0 ? enrichedActants[0] : null,
          };
        });

        setOeuvres(oeuvresWithActants);

        console.log('Oeuvres originales:', recitIas);
        console.log('Oeuvres enrichies:', oeuvresWithActants);
      } catch (error) {
        console.error('Erreur lors du chargement des œuvres', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <div className='grid grid-cols-4 w-full gap-25'>
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
          : oeuvres.map((item: any, index: number) => (
              <motion.div key={item.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                <LgConfCard
                  id={item.id}
                  title={item.title}
                  // Utiliser le premier actant (primaryActant) pour l'affichage
                  actant={item.primaryActant ? item.primaryActant.displayName || `${item.primaryActant.firstname} ${item.primaryActant.lastname}` : ''}
                  date={item.date}
                  url={item.url}
                  thumbnail={item.thumbnail}
                  universite={item.primaryActant && item.primaryActant.universities && item.primaryActant.universities.length > 0 ? item.primaryActant.universities[0].name : ''}
                  type='oeuvre'
                />
              </motion.div>
            ))}
      </div>
    </Layouts>
  );
};
