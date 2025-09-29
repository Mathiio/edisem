import { StudyDayBaner } from "@/components/features/studyDay/StudyDayBaner";
import { StudyDayCarousel } from "@/components/features/studyDay/StudyDayCarousel";
import { Layouts } from "@/components/layout/Layouts";
import * as Items from "@/services/Items";
import { useEffect, useState } from 'react';

export const JourneesEtudes = () => {
  const [studyDayEditions, setStudyDayEditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const editions = await Items.getEditions();
        setStudyDayEditions(editions.filter((ed: any) => ed.editionType === "journée d’études"));
      } catch (error) {
        console.error('Error loading study day editions', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <StudyDayBaner editions={studyDayEditions} />
      <StudyDayCarousel editions={studyDayEditions} loading={loading}/>
    </Layouts>
  );
};