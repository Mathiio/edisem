import { useThemeMode } from '@/hooks/useThemeMode';
import { Route, Routes } from 'react-router-dom';
import { Intervenant } from '@/pages/intervenant';
import { Home } from '@/pages/home';
import { Database } from '@/pages/database';
import { Edition } from '@/pages/corpus/confsByEdition';
import { LoginPage } from '@/pages/login';
import { CahierRecherche } from '@/pages/cahierRecherche';
import { withAuth } from '@/pages/withAuth';
import Visualisation from '@/pages/visualisation';
import { ToastProvider } from '@heroui/react';
import { HeroUIProvider } from '@heroui/react';
import { Intervenants } from '@/pages/intervenants';
import { Colloques } from '@/pages/corpus/Colloques';
import { PratiquesNarratives } from '@/pages/corpus/pratiquesNarratives';
import { JourneesEtudes } from '@/pages/corpus/JourneesEtudes';
import { Seminaires } from '@/pages/corpus/Seminaires';
import { Experimentations } from '@/pages/corpus/Experimentations';
import { MisesEnRecits } from '@/pages/corpus/recits';
import { Oeuvres } from '@/pages/corpus/Oeuvres';
import { Personne } from '@/pages/personne';
import { GenreDetail } from '@/pages/corpus/oeuvresByGenre';
import { RecitsByGenre } from '@/pages/corpus/recitsByGenre';
import { TestPage } from '@/pages/ancienne_page/test';
import { KeywordsDashboard } from '@/pages/analysis/KeywordsDashboard';
import { ConfigurableDetailPage } from '@/pages/generic/ConfigurableDetailPage';
import { conferenceConfig } from '@/pages/generic/config/conferenceConfig';
import { experimentationConfig } from '@/pages/generic/config/experimentationConfig';
import { oeuvreConfig } from '@/pages/generic/config/oeuvreConfig';
import { elementEsthetiqueConfig } from '@/pages/generic/config/elementEsthetiqueConfig';
import { elementNarratifConfig } from '@/pages/generic/config/elementNarratifConfig';
import { feedbackConfig } from '@/pages/generic/config/feedbackConfig';
import { analyseCritiqueConfig } from '@/pages/generic/config/analyseCritiqueConfig';
import { objetTechnoConfig } from '@/pages/generic/config/recitTechnoConfig';
import { toolConfig } from '@/pages/generic/config/toolConfig';
import { documentationScientifiqueConfig } from '@/pages/generic/config/recitScientifiqueConfig';
import { recitmediatiqueConfig } from '@/pages/generic/config/recitmediatiqueConfig';
import { recitcitoyenConfig } from './pages/generic/config/recitcitoyenConfig';

const ProtectedDatabase = withAuth(Database, { requiredRole: 'actant' });
//const ProtectedCahierRecherche = withAuth(CahierRecherche, { requiredRole: 'actant' });

function App() {
  useThemeMode();

  return (
    <HeroUIProvider>
      <ToastProvider />
      <Routes>
        {/* Base routes */}
        <Route index path='/' Component={Home} />
        <Route path='/login' Component={LoginPage} />
        <Route path='/database' Component={ProtectedDatabase} />
        <Route path='/intervenants' Component={Intervenants} />
        <Route path='/visualisation' Component={Visualisation} />
        <Route path='/recherche/' Component={CahierRecherche} />

        {/* Main corpus routes */}
        <Route path='/corpus/seminaires' Component={Seminaires} />
        <Route path='/corpus/colloques' Component={Colloques} />
        <Route path='/corpus/journees-etudes' Component={JourneesEtudes} />
        <Route path='/corpus/pratiques-narratives' Component={PratiquesNarratives} />
        <Route path='/corpus/experimentations' Component={Experimentations} />
        <Route path='/corpus/mises-en-recits' Component={MisesEnRecits} />

        {/* Recits by Genre Routes */}
        <Route path='/corpus/recits-scientifiques' Component={RecitsByGenre} />
        <Route path='/corpus/recits-techno-industriels' Component={RecitsByGenre} />
        <Route path='/corpus/recits-citoyens' Component={RecitsByGenre} />
        <Route path='/corpus/recits-mediatiques' Component={RecitsByGenre} />
        <Route path='/corpus/recits-artistiques' Component={Oeuvres} />

        {/* ============================================ */}
        {/* 🆕 NOUVELLE ARCHITECTURE GÉNÉRIQUE - ROUTES PRINCIPALES */}
        {/* ============================================ */}
        {/* 
          Toutes les pages de détails utilisent maintenant ConfigurableDetailPage
          avec une configuration spécifique. Cela permet de :
          - Centraliser la logique métier dans les configs
          - Réduire la duplication de code
          - Faciliter la maintenance et l'ajout de nouveaux types
          
          Pour ajouter un nouveau type :
          1. Créez un fichier config dans @/pages/generic/config/
          2. Importez la config ici
          3. Ajoutez la route avec ConfigurableDetailPage
        */}

        {/* Routes contextuelles pour les conférences (séminaires, colloques, journées d'études) */}
        <Route path='/corpus/seminaires/edition/:id/:title?' Component={Edition} />
        <Route path='/corpus/colloques/edition/:id/:title?' Component={Edition} />
        <Route path='/corpus/journees-etudes/edition/:id/:title?' Component={Edition} />
        <Route path='/corpus/seminaires/conference/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
        <Route path='/corpus/colloques/conference/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
        <Route path='/corpus/journees-etudes/conference/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />

        {/* Routes pour les items individuels */}
        <Route path='/corpus/oeuvres/genre/:slug' Component={GenreDetail} />
        <Route path='/corpus/experimentation/:id' element={<ConfigurableDetailPage config={experimentationConfig} />} />
        <Route path='/feedback/:id' element={<ConfigurableDetailPage config={feedbackConfig} />} />
        <Route path='/corpus/element-esthetique/:id' element={<ConfigurableDetailPage config={elementEsthetiqueConfig} />} />
        <Route path='/corpus/element-narratif/:id' element={<ConfigurableDetailPage config={elementNarratifConfig} />} />
        <Route path='/corpus/analyse-critique/:id' element={<ConfigurableDetailPage config={analyseCritiqueConfig} />} />
        <Route path='/corpus/tool/:id' element={<ConfigurableDetailPage config={toolConfig} />} />
        <Route path='/corpus/recit-scientifique/:id' element={<ConfigurableDetailPage config={documentationScientifiqueConfig} />} />
        <Route path='/corpus/recit-mediatique/:id' element={<ConfigurableDetailPage config={recitmediatiqueConfig} />} />
        <Route path='/corpus/recit-citoyen/:id' element={<ConfigurableDetailPage config={recitcitoyenConfig} />} />
        <Route path='/corpus/recit-artistique/:id' element={<ConfigurableDetailPage config={oeuvreConfig} />} />
        <Route path='/corpus/recit-techno-industriel/:id' element={<ConfigurableDetailPage config={objetTechnoConfig} />} />

        {/* Routes pour les personnes/intervenants (toujours utilisées directement) */}
        <Route path='/intervenant/:id' Component={Intervenant} />
        <Route path='/personne/:id' Component={Personne} />

        <Route path='/test/' Component={TestPage} />

        {/* Keyword Analysis Route */}
        <Route path='/analysis/keywords' Component={KeywordsDashboard} />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
