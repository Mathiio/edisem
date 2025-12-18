import { GenreCarousel } from '@/components/features/oeuvres/GenresCarousel';
import { LastOeuvres } from '@/components/features/oeuvres/LastOeuvres';
import { OeuvresKeywords } from '@/components/features/oeuvres/OeuvresKeywords';
import { Layouts } from '@/components/layout/Layouts';
import { OeuvreIcon } from '@/components/ui/icons';
import { PageBanner } from '@/components/ui/PageBanner';
import * as Items from '@/services/Items';
import { useCallback, useEffect, useState } from 'react';

export const Oeuvres: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [oeuvres, setOeuvres] = useState<any[]>([]);

  const fetchOeuvresData = useCallback(async () => {
    setLoading(true);
    try {
      // Clear cache to force reload with normalized data
      sessionStorage.removeItem('oeuvres');
      sessionStorage.removeItem('personnes');
      sessionStorage.removeItem('actants');
      sessionStorage.removeItem('students');

      // Get all works (already normalized in the service)
      const oeuvres = await Items.getOeuvres();

      // Verify if oeuvres is a valid array
      if (!Array.isArray(oeuvres)) {
        console.warn('⚠️ getOeuvres() did not return an array:', oeuvres);
        setOeuvres([]);
        return;
      }

      setOeuvres(oeuvres);

    } catch (error) {
      console.error('❌ Error loading oeuvres:', error);
      setOeuvres([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOeuvresData();
  }, [fetchOeuvresData]);

  const uniqueGenres = new Set(
    oeuvres
      .map(oeuvre => oeuvre.genre)
      .filter(genre => genre !== undefined && genre !== null && genre !== '')
  ).size;

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <PageBanner
        icon={<OeuvreIcon size={40} />}
        title="Récits Artistiques/Oeuvres"
        description="Découvrez nos analyses de récits et d'oeuvres artistiques qui constituent le patrimoine éditorial d'Edisem, reflétant la richesse de nos recherches et collaborations académiques."
        stats={[
          { label: "analyses d'œuvres", value: oeuvres.length },
          { label: "genres d'analyses", value: uniqueGenres }
        ]}
      />
      <GenreCarousel oeuvres={oeuvres} loading={loading} />
      <OeuvresKeywords oeuvres={oeuvres} />
      <LastOeuvres oeuvres={oeuvres} loading={loading} />
    </Layouts>
  );
};
