import { Layouts } from "@/components/layout/Layouts";
import { getActants, getUniversities } from "@/lib/Items";
import { useEffect, useState } from "react";
import { IntervenantsCarousel } from "@/components/features/intervenants/IntervenantsCarousel"; 
import { IntervenantsBaner } from "@/components/features/intervenants/IntervenantsBaner";
import { IntervenantsWorldMap } from "@/components/features/intervenants/IntervenantsWorldMap";
import IntervenantsStats from "@/components/features/intervenants/IntervenantsStats";
import KeywordUsageChart from "@/components/features/intervenants/KeywordUsageChart";
import TopIntervenants from "@/components/features/intervenants/TopIntervenants";



export const Intervenants: React.FC = () => {
    const [intervenants, setIntervenants] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);

    useEffect(() => {
        getActants().then(setIntervenants);
        getUniversities().then(setUniversities);
    }, []);

    return (
        <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
            <IntervenantsBaner/>
            <div>
                {intervenants.length > 0 ? (
                <IntervenantsCarousel intervenants={intervenants} />
                ) : (
                <p className="text-c6">Chargement des intervenants...</p>
                )}
            </div>
            <IntervenantsWorldMap
                intervenants={intervenants}
                universities={universities}
            />
            <IntervenantsStats intervenants={intervenants}/>
            <KeywordUsageChart/>
            <TopIntervenants intervenants={intervenants}/>
        </Layouts>
    );
};
