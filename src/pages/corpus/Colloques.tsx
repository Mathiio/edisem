import { ColloquesBaner } from "@/components/features/colloques/ColloquesBaner";
import { Layouts } from "@/components/layout/Layouts";
import { useEffect, useState } from "react";
import * as Items from "@/services/Items"
import { ColloquesCarousel } from "@/components/features/colloques/ColloquesCarousel";



export const Colloques: React.FC = () => {
  const [colloques, setColloques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setColloques(await Items.getColloqueConfs());
      } catch (error) {
        console.error('Error loading colloques', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
       <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
          <ColloquesBaner colloques={colloques}/>
          <ColloquesCarousel colloques={colloques} loading={loading}/>
       </Layouts>
  );
};
