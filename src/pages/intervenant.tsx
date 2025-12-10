import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getConfByActant } from '@/services/api';
import * as Items from '@/services/Items';
import { IntervenantAffiliations } from '@/components/features/intervenants/IntervenantAffiliations';
import { Link } from '@heroui/react';
import { Layouts } from '@/components/layout/Layouts';
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';
import { IntervenantKeywordCloud } from '@/components/features/intervenants/IntervenantKeywordCloud';
import { IntervenantNetwork } from '@/components/features/intervenants/IntervenantNetwork';
import { IntervenantInterventions } from '@/components/features/intervenants/IntervenantInterventions';

export const Intervenant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [actant, setActant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conf, setConf] = useState<any[]>([]);
  const [breadcrumbTitle, setBreadcrumbTitle] = useState('Intervenant');

  const fetchActantData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [actant, confs] = await Promise.all([Items.getActants(id), getConfByActant(id)]);

      setActant(actant);
      setConf(confs);

      // Mettre à jour le titre du breadcrumb avec le nom de l'actant
      const firstName = actant?.firstname || actant?.first_name;
      const lastName = actant?.lastname || actant?.last_name;

      if (firstName && lastName) {
        setBreadcrumbTitle(`${firstName} ${lastName} - Intervenant`);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchActantData();
  }, [id, fetchActantData]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-100'>
      <DynamicBreadcrumbs itemTitle={breadcrumbTitle} />
      <div className='flex flex-col items-center gap-75'>
        <Link isExternal className='gap-20 text-c6 w-fit flex flex-col items-center' href={!loading ? actant?.url : '#'}>
          {actant?.picture ? (
            <img className='w-100 h-100 object-cover rounded-18' src={actant.picture} alt='' />
          ) : (
            <div className='w-100 h-100 rounded-18 object-cover flex items-center justify-center bg-c3'>
              <svg width='26' height='38' viewBox='0 0 32 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M15.999 0C10.397 0 5.8427 4.6862 5.8427 10.4504C5.8427 16.1047 10.1404 20.6809 15.7424 20.8789C15.9135 20.8569 16.0845 20.8569 16.2128 20.8789C16.2556 20.8789 16.2769 20.8789 16.3197 20.8789C16.3411 20.8789 16.3411 20.8789 16.3625 20.8789C21.8362 20.6809 26.1339 16.1047 26.1553 10.4504C26.1553 4.6862 21.601 0 15.999 0Z'
                  fill='#A1A1AA'
                />
                <path
                  d='M26.8617 26.7293C20.8962 22.6371 11.1677 22.6371 5.15945 26.7293C2.44398 28.5993 0.947266 31.1295 0.947266 33.8356C0.947266 36.5417 2.44398 39.0498 5.13807 40.8979C8.1315 42.966 12.0656 44 15.9999 44C19.9341 44 23.8683 42.966 26.8617 40.8979C29.5558 39.0278 31.0525 36.5197 31.0525 33.7916C31.0311 31.0854 29.5558 28.5773 26.8617 26.7293Z'
                  fill='#A1A1AA'
                />
              </svg>
            </div>
          )}
          <div className='flex flex-col items-center gap-1.5'>
            <h1 className='text-64 font-medium text-c6'>{loading ? '' : actant?.firstname + ' ' + actant?.lastname}</h1>
            <p className='text-16 text-c6'>{actant?.interventions} participations</p>
          </div>
        </Link>

        {/* Universités, Écoles, Labos */}
        <div className='w-full'>
          <IntervenantAffiliations
            universities={actant?.universities || []}
            doctoralSchools={actant?.doctoralSchools || []}
            laboratories={actant?.laboratories || []}
            loading={loading}
          />
        </div>
      </div>

      <IntervenantKeywordCloud intervenantConfs={conf} />

      {/* Proximity Graph */}
      <div className='w-full flex flex-col items-center gap-50'>
        <div className='flex flex-col gap-2 justify-center items-center'>
          <h2 className='text-c6 text-32 transition-all ease-in-out'>Réseau de proximité</h2>
          <p className='text-16 text-c5'>Explorez les intervenants qui partagent des thématiques similaires.</p>
        </div>
        <IntervenantNetwork currentActantId={id!} />
      </div>

      <IntervenantInterventions interventions={conf} />
    </Layouts>
  );
};
