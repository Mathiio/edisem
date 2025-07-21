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
import { EtudesDeCas } from './pages/corpus/EtudesDeCas';
import { JourneesEtudes } from './pages/corpus/JourneesEtudes';
import { Oeuvres } from './pages/corpus/Oeuvres';
import { Seminaires } from './pages/corpus/Seminaires';

const ProtectedDatabase = withAuth(Database, { requiredRole: 'actant' });
//const ProtectedCahierRecherche = withAuth(CahierRecherche, { requiredRole: 'actant' });

function App() {
  useThemeMode();

  return (
    <HeroUIProvider>
      <ToastProvider />
      <Routes>
        <Route path='/conference/:id' Component={Conference} />
        <Route path='/intervenant/:id' Component={Intervenant} />
        <Route path='/database' Component={ProtectedDatabase} />
        <Route path='/intervenants' Component={Intervenants} />
        <Route path='/corpus/journees-etudes' Component={JourneesEtudes} />
        <Route path='/corpus/colloques' Component={Colloques} />
        <Route path='/corpus/seminaires' Component={Seminaires} />
        <Route path='/corpus/etudes-de-cas' Component={EtudesDeCas} />
        <Route path='/corpus/oeuvres' Component={Oeuvres} />
        <Route path='/corpus/' Component={CahierRecherche} />
        <Route index path='/' Component={Home} />
        <Route path='/edition/:id/:title?' Component={Edition} />
        <Route path='/login' Component={LoginPage} />
        <Route path='/visualisation' Component={Visualisation} />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
