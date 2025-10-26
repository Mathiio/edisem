import { useThemeMode } from '@/hooks/useThemeMode';
import { Route, Routes } from 'react-router-dom';
import { Conference } from '@/pages/corpus/conference';
import { Intervenant } from '@/pages/intervenant';
import { Home } from '@/pages/home';
import { Database } from '@/pages/database';
import { Edition } from '@/pages/corpus/edition';
import { LoginPage } from '@/pages/login';
import { CahierRecherche } from '@/pages/cahierRecherche';
import { withAuth } from '@/pages/withAuth';
import Visualisation from '@/pages/visualisation';
import { ToastProvider } from '@heroui/react';
import { HeroUIProvider } from '@heroui/react';
import { Intervenants } from '@/pages/intervenants';
import { Colloques } from '@/pages/corpus/Colloques';
import { PratiqueNarrative } from '@/pages/corpus/PratiqueNarrative';
import { JourneesEtudes } from '@/pages/corpus/JourneesEtudes';
import { MiseEnRecits } from '@/pages/corpus/MiseEnRecits';
import { Seminaires } from '@/pages/corpus/Seminaires';
import { Experimentations } from '@/pages/corpus/Experimentations';
import { Experimentation } from '@/pages/experimentation';
import { miseEnRecit } from '@/pages/miseEnRecit';
import { Feedback } from '@/pages/feedback';
import { Oeuvres } from '@/pages/corpus/Oeuvres';
import { Oeuvre } from '@/pages/corpus/oeuvre';
import { Personne } from '@/pages/personne';
import { GenreDetail } from '@/pages/corpus/genre';
import { ElementNarratif } from '@/pages/elementnarratif';
import { ElementEsthetique } from '@/pages/elementesthetique';
import { AnalyseCritique } from './pages/analysecritique';

// 🆕 Import de l'architecture générique (pour tests)
import { ConfigurableDetailPage } from '@/pages/generic/ConfigurableDetailPage';
import { conferenceConfig } from '@/pages/generic/config/conferenceConfig';
import { experimentationConfig } from '@/pages/generic/config/experimentationConfig';
import { miseEnRecitConfig } from '@/pages/generic/config/miseEnRecitConfig';
import { oeuvreConfig } from '@/pages/generic/config/oeuvreConfig';
import { elementEsthetiqueConfig } from '@/pages/generic/config/elementEsthetiqueConfig';
import { elementNarratifConfig } from '@/pages/generic/config/elementNarratifConfig';
import { feedbackConfig } from '@/pages/generic/config/feedbackConfig';
import { analyseCritiqueConfig } from '@/pages/generic/config/analyseCritiqueConfig';
import { objetTechnoConfig } from '@/pages/generic/config/objetTechnoConfig';

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
        <Route path='/corpus/pratiques-narratives' Component={PratiqueNarrative} />
        <Route path='/corpus/mise-en-recits' Component={MiseEnRecits} />
        <Route path='/corpus/experimentations' Component={Experimentations} />
        <Route path='/corpus/oeuvres' Component={Oeuvres} />
        <Route path='/corpus/element-narratif/:id' Component={ElementNarratif} />
        <Route path='/corpus/element-esthetique/:id' Component={ElementEsthetique} />
        <Route path='/corpus/analyse-critique/:id' Component={AnalyseCritique} />
        {/* Contextual edition routes */}
        <Route path='/corpus/seminaires/edition/:id/:title?' Component={Edition} />
        <Route path='/corpus/colloques/edition/:id/:title?' Component={Edition} />
        <Route path='/corpus/journees-etudes/edition/:id/:title?' Component={Edition} />

        {/* Contextual conference routes */}
        <Route path='/corpus/seminaires/conference/:id' Component={Conference} />
        <Route path='/corpus/colloques/conference/:id' Component={Conference} />
        <Route path='/corpus/journees-etudes/conference/:id' Component={Conference} />

        {/* Individual item routes */}
        <Route path='/corpus/oeuvres/genre/:slug' Component={GenreDetail} />
        <Route path='/corpus/experimentation/:id' Component={Experimentation} />
        <Route path='/corpus/mise-en-recit/:id' Component={miseEnRecit} />
        <Route path='/corpus/oeuvre/:id' Component={Oeuvre} />
        <Route path='/feedback/:id' Component={Feedback} />
        <Route path='/intervenant/:id' Component={Intervenant} />
        <Route path='/personne/:id' Component={Personne} />

        {/* 🆕 ROUTES DE TEST - Nouvelle architecture générique (1 SEUL fichier par type!) */}
        {/* Plus besoin de créer une page - on utilise directement la config! */}
        {/* Pour tester, ajoutez "-new" dans l'URL, ex: /corpus/seminaires/conference-new/:id */}
        <Route path='/corpus/seminaires/conference-new/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
        <Route path='/corpus/colloques/conference-new/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
        <Route path='/corpus/journees-etudes/conference-new/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
        <Route path='/corpus/experimentation-new/:id' element={<ConfigurableDetailPage config={experimentationConfig} />} />
        <Route path='/corpus/mise-en-recit-new/:id' element={<ConfigurableDetailPage config={miseEnRecitConfig} />} />
        <Route path='/corpus/oeuvre-new/:id' element={<ConfigurableDetailPage config={oeuvreConfig} />} />
        <Route path='/corpus/element-esthetique-new/:id' element={<ConfigurableDetailPage config={elementEsthetiqueConfig} />} />
        <Route path='/corpus/element-narratif-new/:id' element={<ConfigurableDetailPage config={elementNarratifConfig} />} />
        <Route path='/feedback-new/:id' element={<ConfigurableDetailPage config={feedbackConfig} />} />
        <Route path='/corpus/analyse-critique-new/:id' element={<ConfigurableDetailPage config={analyseCritiqueConfig} />} />
        <Route path='/corpus/objet-techno/:id' element={<ConfigurableDetailPage config={objetTechnoConfig} />} />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
