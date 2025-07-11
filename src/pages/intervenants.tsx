import { Layouts } from "@/components/layout/Layouts";
import { getActants, getUniversities } from "@/lib/Items";
import { useEffect, useMemo, useState } from "react";
import { ActantCarousel } from "@/components/features/actants/ActantsCarousel"; 
import { ActantsBaner } from "@/components/features/actants/ActantsBaner";
import { ActantsWorldMap } from "@/components/features/actants/ActantsWorldMap";



export const Intervenants: React.FC = () => {
    const [actants, setActants] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);

    useEffect(() => {
        getActants().then(setActants);
        getUniversities().then(setUniversities);
    }, []);

    const countries = useMemo(() => {
        if (!universities) return [];
        return Array.from(new Set(universities.map(u => u.country)));
    }, [universities]);

    return (
        <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
            <ActantsBaner/>
            <div>
                {actants.length > 0 ? (
                <ActantCarousel actants={actants} />
                ) : (
                <p className="text-c6">Chargement des intervenants...</p>
                )}
            </div>
            <ActantsWorldMap highlightedCountries={countries} />
        </Layouts>
    );
};
