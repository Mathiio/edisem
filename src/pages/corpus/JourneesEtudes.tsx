import { Layouts } from "@/components/layout/Layouts";
import { useEffect, useState } from "react";
import * as Items from "@/lib/Items"
import { StudyDayBaner } from "@/components/features/studyDay/StudyDayBaner";
import { StudyDayCarousel } from "@/components/features/studyDay/StudyDayCarousel";



export const JourneesEtudes: React.FC = () => {
  const [studyDay, setStudyDay] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setStudyDay(await Items.getStudyDayConfs());
      } catch (error) {
        console.error('Error loading colloques', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
       <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
          <StudyDayBaner studyDay={studyDay}/>
          <StudyDayCarousel studyDay={studyDay} loading={loading}/>
       </Layouts>
  );
};
