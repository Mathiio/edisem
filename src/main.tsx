import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { HeroUIProvider } from "@heroui/react";
import './main.css';

function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return <HeroUIProvider navigate={navigate}>{children}</HeroUIProvider>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>,
);