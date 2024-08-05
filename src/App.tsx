import { useThemeMode } from '@/hooks/use-theme-mode';
import { Route, Routes } from 'react-router-dom';
import { Conference } from '@/pages/conference';
import { Conferencier } from '@/pages/conferencier';
import { Home } from '@/pages/home';
import { Recherche } from '@/pages/recherche';
// import { Database } from '@/pages/database';
import { Edition } from '@/pages/edition';

function App() {
  useThemeMode();

  return (
    <Routes>
      <Route path='/conference/:id' element={<Conference />} />
      <Route path='/conferencier/:id' element={<Conferencier />} />
      <Route path='/recherche' Component={Recherche} />
      <Route path='/home' Component={Home} />
      {/* <Route path='/database' Component={Database} /> */}
      <Route path='/' Component={Home} />
      <Route path='/edition/:id/:title?' element={<Edition />} />
    </Routes>
  );
}

export default App;
