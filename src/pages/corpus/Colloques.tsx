import { ColloquesBaner } from "@/components/features/colloques/ColloquesBaner";
import { ColloquesCarousel } from "@/components/features/colloques/ColloquesCarousel";
import { Layouts } from "@/components/layout/Layouts";
import * as Items from "@/services/Items";
import { useEffect, useState } from 'react';

export const Colloques = () => {
  const [colloqueEditions, setColloqueEditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const editions = await Items.getEditions();
        setColloqueEditions(editions.filter((ed: any) => ed.editionType === "colloque"));
      } catch (error) {
        console.error('Error loading colloques editions', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <ColloquesBaner editions={colloqueEditions} />
      <ColloquesCarousel editions={colloqueEditions} loading={loading}/>
    </Layouts>
  );
};