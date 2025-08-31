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
        console.log(data)
      } catch (error) {
        console.error('Erreur lors du chargement des œuvres', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <OeuvresBaner oeuvres={oeuvres}/>
      <OeuvresKeywords oeuvres={oeuvres}/>
      {/* <LastOeuvres oeuvres={oeuvres} loading={loading} /> */}
    </Layouts>
  );
};
