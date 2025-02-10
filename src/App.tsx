import { useThemeMode } from '@/hooks/use-theme-mode';
import { Route, Routes } from 'react-router-dom';
import { Conference } from '@/pages/conference';
import { Conferencier } from '@/pages/conferencier';
import { Home } from '@/pages/home';
import { Database } from '@/pages/database';
import { Edition } from '@/pages/edition';
import { LoginPage } from '@/pages/login';
import { withAuth } from '@/pages/withAuth';
import Visualisation from './pages/visualisation';

// Protection des routes avec les droits appropriés
const ProtectedDatabase = withAuth(Database, { requiredRole: 'Actant' });
const ProtectedEdition = withAuth(Edition, { requiredRole: 'Actant' });
const ProtectedVisualisation = withAuth(Visualisation, { requiredRole: 'any' });
const ProtectedConference = withAuth(Conference, { requiredRole: 'any' });
const ProtectedConferencier = withAuth(Conferencier, { requiredRole: 'any' });

function App() {
  useThemeMode();

  return (
    <Routes>
      <Route path='/conference/:id' Component={ProtectedConference} />
      <Route path='/conferencier/:id' Component={ProtectedConferencier} />
      <Route path='/database' Component={ProtectedDatabase} />
      <Route index path='/' Component={Home} />
      <Route path='/edition/:id/:title?' Component={ProtectedEdition} />
      <Route path='/login' Component={LoginPage} />
      <Route path='/visualisation' Component={ProtectedVisualisation} />
    </Routes>
  );
}

export default App;
