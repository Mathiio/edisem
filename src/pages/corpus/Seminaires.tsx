import { EditionsCarousel } from "@/components/features/seminaires/EditionsCarousel";
import { SeminairesBaner } from "@/components/features/seminaires/SeminairesBaner";
import { TopKeywords } from "@/components/features/seminaires/TopKeywords";
import { Layouts } from "@/components/layout/Layouts";



export const Seminaires: React.FC = () => {


  return (
       <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
          <SeminairesBaner/>
          <EditionsCarousel />
          <TopKeywords />
       </Layouts>
  );
};
