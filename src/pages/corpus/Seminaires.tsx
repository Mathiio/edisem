import { SeminairesCarousel } from "@/components/features/seminaires/SeminairesCarousel";
import { SeminairesBaner } from "@/components/features/seminaires/SeminairesBaner";
import { TopKeywords } from "@/components/features/seminaires/TopKeywords";
import { Layouts } from "@/components/layout/Layouts";
import * as Items from "@/services/Items";
import { useEffect, useState } from 'react';

export const Seminaires = () => {
  const [seminaires, setSeminaires] = useState([]);
  const [seminarEditions, setSeminarEditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const editions = await Items.getEditions();
        setSeminarEditions(editions.filter((ed: any) => ed.editionType === 'séminaire'));
        setSeminaires(await Items.getSeminarConfs());
      } catch (error) {
        console.error('Error loading seminars & editions', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <SeminairesBaner editions={seminarEditions} />
      <SeminairesCarousel editions={seminarEditions} loading={loading}/>
      <TopKeywords seminaires={seminaires} loading={loading} />
    </Layouts>
  );
};