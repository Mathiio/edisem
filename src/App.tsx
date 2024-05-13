import { useThemeMode } from '@/hooks/use-theme-mode';
import { Route, Routes } from 'react-router-dom';
import { Playground } from '@/pages/playground';
import { Home } from '@/pages/home';

function App() {
  useThemeMode();

  return (
    <Routes>
      <Route path='/playground' Component={ Playground } />
      <Route path='/' Component={ Home } />
    </Routes>
  );
}

export default App;
