import { useThemeMode } from '@/hooks/use-theme-mode';
import { Route, Routes } from 'react-router-dom';
import { Conference } from '@/pages/conference';
import { Conferencier } from '@/pages/conferencier';
import { Home } from '@/pages/home';
import { Recherche } from './pages/recherche';
import { Database } from './pages/database';
function App() {
  useThemeMode();

  return (
    <Routes>
      <Route path='/conference' Component={Conference} />
      <Route path='/conferencier' Component={Conferencier} />
      <Route path='/recherche' Component={Recherche} />
      <Route path='/database' Component={Database} />
      <Route path='/' Component={Home} />
    </Routes>
  );
}

export default App;
