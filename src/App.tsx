import { useThemeMode } from '@/hooks/useThemeMode';
import { Route, Routes } from 'react-router-dom';
// ❌ Anciens imports pour les composants individuels (maintenant remplacés par ConfigurableDetailPage)
// Conservés pour référence mais ne sont plus utilisés
// import { Conference } from '@/pages/corpus/conference';
// import { Experimentation } from '@/pages/experimentation';
// import { miseEnRecit } from '@/pages/miseEnRecit';
// import { Feedback } from '@/pages/feedback';
// import { Oeuvre } from '@/pages/corpus/oeuvre';
// import { ElementNarratif } from '@/pages/elementnarratif';
// import { ElementEsthetique } from '@/pages/elementesthetique';
// import { AnalyseCritique } from './pages/analysecritique';
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
import { Colloques } from '@/pages/corpus/colloques';
import { PratiqueNarrative } from '@/pages/corpus/pratiqueNarrative';
import { JourneesEtudes } from '@/pages/corpus/journeesEtudes';
import { Seminaires } from '@/pages/corpus/seminaires';
import { Experimentations } from '@/pages/corpus/experimentations';
import { Oeuvres } from '@/pages/corpus/Oeuvres';
import { Personne } from '@/pages/personne';
import { GenreDetail } from '@/pages/corpus/genre';
import { TestPage } from '@/pages/test';
import { KeywordsDashboard } from '@/pages/analysis/KeywordsDashboard';

// 🆕 NOUVELLE ARCHITECTURE GÉNÉRIQUE - Système principal
// Toutes les pages de détails utilisent maintenant ConfigurableDetailPage avec une configuration
// Cela permet de centraliser la logique et de réduire la duplication de code
// Pour ajouter un nouveau type d'item, créez simplement un fichier de config dans @/pages/generic/config/
import { ConfigurableDetailPage } from '@/pages/generic/ConfigurableDetailPage';
import { conferenceConfig } from '@/pages/generic/config/conferenceConfig';
import { experimentationConfig } from '@/pages/generic/config/experimentationConfig';
import { oeuvreConfig } from '@/pages/generic/config/oeuvreConfig';
import { elementEsthetiqueConfig } from '@/pages/generic/config/elementEsthetiqueConfig';
import { elementNarratifConfig } from '@/pages/generic/config/elementNarratifConfig';
import { feedbackConfig } from '@/pages/generic/config/feedbackConfig';
import { analyseCritiqueConfig } from '@/pages/generic/config/analyseCritiqueConfig';
import { objetTechnoConfig } from '@/pages/generic/config/objetTechnoConfig';
import { toolConfig } from '@/pages/generic/config/toolConfig';
import { documentationScientifiqueConfig } from '@/pages/generic/config/documentationScientifiqueConfig';
import { recitmediatiqueConfig } from '@/pages/generic/config/recitmediatiqueConfig';

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
        <Route path='/corpus/experimentations' Component={Experimentations} />
        <Route path='/corpus/oeuvres' Component={Oeuvres} />
        {/* ❌ Anciennes routes pour les éléments individuels - remplacées par ConfigurableDetailPage ci-dessous */}
        {/* <Route path='/corpus/element-narratif/:id' Component={ElementNarratif} /> */}
        {/* <Route path='/corpus/element-esthetique/:id' Component={ElementEsthetique} /> */}
        {/* <Route path='/corpus/analyse-critique/:id' Component={AnalyseCritique} /> */}
        {/* Contextual edition routes */}
        <Route path='/corpus/seminaires/edition/:id/:title?' Component={Edition} />
        <Route path='/corpus/colloques/edition/:id/:title?' Component={Edition} />
        <Route path='/corpus/journees-etudes/edition/:id/:title?' Component={Edition} />

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
        <Route path='/corpus/seminaires/conference/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
        <Route path='/corpus/colloques/conference/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />
        <Route path='/corpus/journees-etudes/conference/:id' element={<ConfigurableDetailPage config={conferenceConfig} />} />

        {/* Routes pour les items individuels */}
        <Route path='/corpus/oeuvres/genre/:slug' Component={GenreDetail} />
        <Route path='/corpus/experimentation/:id' element={<ConfigurableDetailPage config={experimentationConfig} />} />
        <Route path='/corpus/oeuvre/:id' element={<ConfigurableDetailPage config={oeuvreConfig} />} />
        <Route path='/feedback/:id' element={<ConfigurableDetailPage config={feedbackConfig} />} />
        <Route path='/corpus/element-esthetique/:id' element={<ConfigurableDetailPage config={elementEsthetiqueConfig} />} />
        <Route path='/corpus/element-narratif/:id' element={<ConfigurableDetailPage config={elementNarratifConfig} />} />
        <Route path='/corpus/analyse-critique/:id' element={<ConfigurableDetailPage config={analyseCritiqueConfig} />} />
        <Route path='/corpus/objet-techno/:id' element={<ConfigurableDetailPage config={objetTechnoConfig} />} />
        <Route path='/corpus/tool/:id' element={<ConfigurableDetailPage config={toolConfig} />} />
        <Route path='/corpus/documentation-scientifique/:id' element={<ConfigurableDetailPage config={documentationScientifiqueConfig} />} />
        <Route path='/corpus/recit-mediatique/:id' element={<ConfigurableDetailPage config={recitmediatiqueConfig} />} />

        {/* Routes pour les personnes/intervenants (toujours utilisées directement) */}
        <Route path='/intervenant/:id' Component={Intervenant} />
        <Route path='/personne/:id' Component={Personne} />

        <Route path='/test/' Component={TestPage} />

        {/* ============================================ */}
        {/* ❌ ANCIENNES ROUTES - DÉSACTIVÉES */}
        {/* ============================================ */}
        {/* 
          Les routes suivantes sont commentées car elles utilisent les anciens composants
          individuels. Elles sont conservées pour référence mais ne sont plus actives.
          Le nouveau système utilise ConfigurableDetailPage avec des configurations.
        */}
        {/* 
        <Route path='/corpus/seminaires/conference/:id' Component={Conference} />
        <Route path='/corpus/colloques/conference/:id' Component={Conference} />
        <Route path='/corpus/journees-etudes/conference/:id' Component={Conference} />
        <Route path='/corpus/experimentation/:id' Component={Experimentation} />
        <Route path='/corpus/mise-en-recit/:id' Component={miseEnRecit} />
        <Route path='/corpus/oeuvre/:id' Component={Oeuvre} />
        <Route path='/feedback/:id' Component={Feedback} />
        <Route path='/corpus/element-narratif/:id' Component={ElementNarratif} />
        <Route path='/corpus/element-esthetique/:id' Component={ElementEsthetique} />
        <Route path='/corpus/analyse-critique/:id' Component={AnalyseCritique} />
        */}

        {/* Keyword Analysis Route */}
        <Route path='/analysis/keywords' Component={KeywordsDashboard} />
        
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
