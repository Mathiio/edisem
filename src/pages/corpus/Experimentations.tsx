import { LgConfCard, LgConfSkeleton } from '@/components/features/home/ConfCards';
import { Layouts } from '@/components/layout/Layouts';
import { getExperimentations, getActants } from '@/lib/Items';
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
  const [filteredExperimentations, setFilteredExperimentations] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchAndProcessData = async () => {
      try {
        // Récupérer les expérimentations (déjà compatibles avec les conférences)
        const [experimentations, actants] = await Promise.all([getExperimentations(), getActants()]);
        const actant = actants.find((a: any) => a.id === '17230');
        console.log(actant);

        // Créer un map des actants pour lier l'ID actant avec l'objet complet
        const actantMap = new Map();
        actants.forEach((actant: any) => {
          actantMap.set(actant.id, actant);
          actantMap.set(String(actant.id), actant);
          actantMap.set(Number(actant.id), actant);
        });

        // Enrichir avec les données complètes de l'actant (comme pour les conférences)
        const experimentationsWithActants = experimentations.map((experimentation: any) => ({
          ...experimentation,
          // Remplacer l'ID actant par l'objet complet (comme dans getConfs)
          actant: experimentation.actant ? actantMap.get(experimentation.actant) || actantMap.get(Number(experimentation.actant)) : null,
        }));

        setFilteredExperimentations(experimentationsWithActants);

        console.log(experimentations);
        console.log(experimentationsWithActants);
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
      <div className='grid grid-cols-4 w-full gap-25'>
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
          : filteredExperimentations.map((item: any, index: number) => (
              <motion.div key={item.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                <LgConfCard
                  id={item.id}
                  title={item.title}
                  actant={item.actant ? `${item.actant.firstname} ${item.actant.lastname}` : ''}
                  date={item.date}
                  url={item.url}
                  thumbnail={item.thumbnail}
                  universite={item.actant && item.actant.universities && item.actant.universities.length > 0 ? item.actant.universities[0].name : ''}
                  type='experimentation'
                />
              </motion.div>
            ))}
      </div>
    </Layouts>
  );
};
