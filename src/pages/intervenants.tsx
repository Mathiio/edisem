import { Layouts } from "@/components/layout/Layouts";
import { getActants, getUniversities } from "@/services/Items";
import { useEffect, useState } from "react";
import { IntervenantsCarousel } from "@/components/features/intervenants/IntervenantsCarousel"; 
import { IntervenantsWorldMap } from "@/components/features/intervenants/IntervenantsWorldMap";
import IntervenantsStats from "@/components/features/intervenants/IntervenantsStats";
import KeywordUsageChart from "@/components/features/intervenants/KeywordUsageChart";
import TopIntervenants from "@/components/features/intervenants/TopIntervenants";
import { PageBanner } from "@/components/ui/PageBanner";



export const Intervenants: React.FC = () => {
    const [intervenants, setIntervenants] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);

    useEffect(() => {
        getActants().then(setIntervenants);
        getUniversities().then(setUniversities);
    }, []);

    return (
        <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
            <PageBanner
                title={
                    <>
                        <span>Découvrez les voix</span>
                        <span className='bg-gradient-to-t from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-top font-[500]'>
                        qui façonnent Edisem
                        </span>
                    </>
                }
                description="Retrouvez ici les chercheur·euses, artistes, doctorant·es et penseur·euses qui façonnent la réflexion autour des arts, du design, des humanités numériques et de l'intelligence artificielle."
            />
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
