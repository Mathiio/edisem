import { LastOeuvres } from '@/components/features/oeuvres/LastOeuvres';
import { OeuvresBaner } from '@/components/features/oeuvres/OeuvresBaner';
import { OeuvresKeywords } from '@/components/features/oeuvres/OeuvresKeywords';
import { Layouts } from '@/components/layout/Layouts';
import { getOeuvres, getActants, getStudents } from '@/services/Items';
import { useEffect, useState } from 'react';

export const Oeuvres: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [oeuvres, setOeuvres] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchAndProcessData = async () => {
      try {
        // Récupérer les œuvres (RecitIas), actants ET students
        const [oeuvres, actants, students] = await Promise.all([getOeuvres(), getActants(), getStudents()]);
        // Vérifier si oeuvres est un tableau valide
        if (!Array.isArray(oeuvres) || oeuvres.length === 0) {
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
        const oeuvresWithActants = oeuvres.map((oeuvre: any) => {
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
      <OeuvresBaner oeuvres={oeuvres} />
      <OeuvresKeywords oeuvres={oeuvres} />
      <LastOeuvres oeuvres={oeuvres} loading={loading} />
    </Layouts>
  );
};
