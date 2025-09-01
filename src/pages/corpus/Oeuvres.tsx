import { LastOeuvres } from '@/components/features/oeuvres/LastOeuvres';
import { OeuvresBaner } from '@/components/features/oeuvres/OeuvresBaner';
import { OeuvresKeywords } from '@/components/features/oeuvres/OeuvresKeywords';
import { Layouts } from '@/components/layout/Layouts';
import * as Items from '@/lib/Items';
import { useEffect, useState } from 'react';




export const Oeuvres: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [oeuvres, setOeuvres] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await Items.getOeuvres();
        setOeuvres(data);
      } catch (error) {
        console.error('Erreur lors du chargement des œuvres', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fonction helper pour extraire le nom de l'actant
  const getActantDisplayName = (item: any) => {
    // Priorité : primaryActant > enrichedActants > actant brut
    if (item.primaryActant) {
      return (
        item.primaryActant.displayName ||
        `${item.primaryActant.firstname || ''} ${item.primaryActant.lastname || ''}`.trim() ||
        `Actant ${item.primaryActant.id}` ||
        'Actant inconnu'
      );
    }

    // Fallback si pas de primaryActant
    if (item.actant) {
      return `Actant ${item.actant}`;
    }

    if (item.actants && item.actants.length > 0) {
      return item.actants[0];
    }

    return '';
  };

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <OeuvresBaner oeuvres={oeuvres}/>
      <OeuvresKeywords oeuvres={oeuvres}/>
      <LastOeuvres oeuvres={oeuvres} loading={loading} />
    </Layouts>
  );
};
