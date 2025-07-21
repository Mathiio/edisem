import { Layouts } from "@/components/layout/Layouts";
import { getActants, getUniversities } from "@/lib/Items";
import { useEffect, useState } from "react";
import { IntervenantsCarousel } from "@/components/features/actants/IntervenantsCarousel"; 
import { IntervenantsBaner } from "@/components/features/actants/IntervenantsBaner";
import { IntervenantsWorldMap } from "@/components/features/actants/IntervenantsWorldMap";



export const Intervenants: React.FC = () => {
    const [actants, setActants] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);

    useEffect(() => {
        getActants().then(setActants);
        getUniversities().then(setUniversities);
    }, []);

    return (
        <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
            <IntervenantsBaner/>
            <div>
                {actants.length > 0 ? (
                <IntervenantsCarousel actants={actants} />
                ) : (
                <p className="text-c6">Chargement des intervenants...</p>
                )}
            </div>
            <IntervenantsWorldMap
                actants={actants}
                universities={universities}
            />
        </Layouts>
    );
};
