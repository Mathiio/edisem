import { useThemeMode } from '@/hooks/useThemeMode';
import { Route, Routes } from 'react-router-dom';
import { Conference } from '@/pages/conference';
import { Intervenant } from '@/pages/intervenant';
import { Home } from '@/pages/home';
import { Database } from '@/pages/database';
import { Edition } from '@/pages/edition';
import { LoginPage } from '@/pages/login';
import { CahierRecherche } from '@/pages/cahierRecherche';
import { withAuth } from '@/pages/withAuth';
import Visualisation from './pages/visualisation';
import { ToastProvider } from '@heroui/react';
import { HeroUIProvider } from '@heroui/react';
import { Intervenants } from './pages/intervenants';
import { Colloques } from './pages/corpus/Colloques';
import { PratiqueNarrative } from './pages/corpus/PratiqueNarrative';
import { JourneesEtudes } from './pages/corpus/JourneesEtudes';
import { MiseEnRecits } from './pages/corpus/MiseEnRecits';
import { Seminaires } from './pages/corpus/Seminaires';
import { Experimentations } from './pages/corpus/Experimentations';
import { Experimentation } from './pages/experimentation';
import { miseEnRecit } from '@/pages/miseEnRecit';
import { Feedback } from './pages/feedback';
import { Oeuvres } from './pages/corpus/Oeuvres';
import { Oeuvre } from './pages/oeuvre';

const ProtectedDatabase = withAuth(Database, { requiredRole: 'actant' });
//const ProtectedCahierRecherche = withAuth(CahierRecherche, { requiredRole: 'actant' });

function App() {
  useThemeMode();

  return (
    <HeroUIProvider>
      <ToastProvider />
      <Routes>
        <Route path='/conference/:id' Component={Conference} />
        <Route path='/experimentation/:id' Component={Experimentation} />
        <Route path='/corpus/mise-en-recit/:id' Component={miseEnRecit} />
        <Route path='/feedback/:id' Component={Feedback} />
        <Route path='/intervenant/:id' Component={Intervenant} />
        <Route path='/database' Component={ProtectedDatabase} />
        <Route path='/intervenants' Component={Intervenants} />
        <Route path='/corpus/journees-etudes' Component={JourneesEtudes} />
        <Route path='/corpus/colloques' Component={Colloques} />
        <Route path='/corpus/seminaires' Component={Seminaires} />
        <Route path='/corpus/pratique-narrative' Component={PratiqueNarrative} />
        <Route path='/corpus/mise-en-recits' Component={MiseEnRecits} />
        <Route path='/corpus/experimentations' Component={Experimentations} />
        <Route path='/corpus/oeuvres' Component={Oeuvres} />
        <Route path='/oeuvre/:id' Component={Oeuvre} />
        <Route path='/recherche/' Component={CahierRecherche} />
        <Route index path='/' Component={Home} />
        <Route path='/edition/:id/:title?' Component={Edition} />
        <Route path='/login' Component={LoginPage} />
        <Route path='/visualisation' Component={Visualisation} />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
