import { EditionsCarousel } from "@/components/features/seminaires/EditionsCarousel";
import { SeminairesBaner } from "@/components/features/seminaires/SeminairesBaner";
import { TopKeywords } from "@/components/features/seminaires/TopKeywords";
import { Layouts } from "@/components/layout/Layouts";
import * as Items from "@/lib/Items";
import { useEffect, useState } from 'react';

export const Seminaires = () => {
  const [seminaires, setSeminaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setSeminaires(await Items.getSeminarConfs());
      } catch (error) {
        console.error('Error loading seminars', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
          <SeminairesBaner seminaires={seminaires} />
          <EditionsCarousel seminaires={seminaires} loading={loading}/>
          <TopKeywords seminaires={seminaires} loading={loading} />
    </Layouts>
  );
};
