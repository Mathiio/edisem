import { GenreCarousel } from '@/components/features/oeuvres/GenresCarousel';
import { LastOeuvres } from '@/components/features/oeuvres/LastOeuvres';
import { Layouts } from '@/components/layout/Layouts';
import { OeuvreIcon } from '@/components/ui/icons';
import { PageBanner } from '@/components/ui/PageBanner';
import * as Items from '@/services/Items';
import { useCallback, useEffect, useState } from 'react';

export const Oeuvres: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [recitsArtistiques, setOeuvres] = useState<any[]>([]);

  const fetchOeuvresData = useCallback(async () => {
    setLoading(true);
    try {
      // Clear cache to force reload with normalized data
      sessionStorage.removeItem('recitsArtistiques');
      sessionStorage.removeItem('personnes');
      sessionStorage.removeItem('actants');
      sessionStorage.removeItem('students');

      // Get all works (already normalized in the service)
      const recitsArtistiques = await Items.getRecitsArtistiques();

      // Verify if recitsArtistiques is a valid array
      if (!Array.isArray(recitsArtistiques)) {
        setOeuvres([]);
        return;
      }

      setOeuvres(recitsArtistiques);

    } catch (error) {
      console.error('❌ Error loading recitsArtistiques:', error);
      setOeuvres([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOeuvresData();
  }, [fetchOeuvresData]);

  const uniqueGenres = new Set(
    recitsArtistiques
      .map(recit_artistique => recit_artistique.genre)
      .filter(genre => genre !== undefined && genre !== null && genre !== '')
  ).size;

  return (
    <Layouts className='col-span-10 flex flex-col gap-150 z-0 overflow-visible'>
      <PageBanner
        icon={<OeuvreIcon size={40} />}
        title="Récits Artistiques/Oeuvres"
        description="Découvrez nos analyses de récits et d'oeuvres artistiques qui constituent le patrimoine éditorial d'Edisem, reflétant la richesse de nos recherches et collaborations académiques."
        stats={[
          { label: "récits artistiques", value: recitsArtistiques.length },
          { label: "genre de récits artistiques", value: uniqueGenres }
        ]}
      />
      <GenreCarousel recitsArtistiques={recitsArtistiques} loading={loading} />
      <LastOeuvres recitsArtistiques={recitsArtistiques} loading={loading} />
    </Layouts>
  );
};
