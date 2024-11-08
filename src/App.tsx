import { useThemeMode } from '@/hooks/use-theme-mode';
import { Route, Routes } from 'react-router-dom';
import { Conference } from '@/pages/conference';
import { Conferencier } from '@/pages/conferencier';
import { Home } from '@/pages/home';
import { Database } from '@/pages/database';
import { Edition } from '@/pages/edition';
import LoginPage from '@/pages/login';
import { withAuth } from '@/pages/withAuth';
import Datavisualisation from './pages/datavisualisation';

const ProtectedDatabase = withAuth(Database);

function App() {
  useThemeMode();

  return (
    <Routes>
      <Route path='/conference/:id' Component={Conference} />
      <Route path='/conferencier/:id' Component={Conferencier} />
      <Route path='/database' Component={ProtectedDatabase} />
      <Route index path='/' Component={Home} />
      <Route path='/edition/:id/:title?' Component={Edition} />
      <Route path='/login' Component={LoginPage} />
      <Route path='/datavisualisation' Component={Datavisualisation} />
    </Routes>
  );
}

export default App;
