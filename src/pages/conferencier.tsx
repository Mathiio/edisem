import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { useFetchData } from '../hooks/useFetchData';
import { fetchSpeakerDetails } from '../services/api';

export const Conferencier: React.FC = () => {
  const { data: speakers, loading: speakersLoading, error: speakersError } = useFetchData(1375);
  const [speakerDetails, setSpeakerDetails] = useState<any[]>([]);

  useEffect(() => {
    if (!speakersLoading && !speakersError && speakers !== null) {
      const fetchSpeakersDetails = async () => {
        const details = await Promise.all(
          speakers.map(async (speaker) => {
            const details = await fetchSpeakerDetails(speaker['@id']);
            return details;
          }),
        );
        setSpeakerDetails(details);
      };

      fetchSpeakersDetails();
    }
  }, [speakersLoading, speakersError, speakers]);

  if (speakersLoading) return <div>Loading...</div>;
  if (speakersError) return <div>Error: {speakersError.message}</div>;

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'>
          <div className='col-span-10'>
            <Navbar />
            <div>
              <h1 className='font-semibold text-32 pt-25 pb-25'>Data from API:</h1>
              {speakerDetails && speakerDetails.length > 0
                ? speakerDetails.map((item, index) => (
                    <div key={index}>
                      <h2 className=' text-16 '>
                        {item['o:title']} -
                        {item['jdc:hasUniversity'] ? item['jdc:hasUniversity'][0].display_title : 'Unknown'}
                      </h2>
                    </div>
                  ))
                : ''}
            </div>
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
