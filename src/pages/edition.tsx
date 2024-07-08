import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { getEdition } from '../services/api';

export const Edition: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [edition, setEdition] = useState<{ title: string; numConf: number }[]>([]);

  useEffect(() => {
    (async () => {
      const edition = await getEdition(Number(id));
      setEdition(edition);
    })();
  }, []);

  return (
    <div>
      <h1>Détails de l'édition {id}</h1>
      
    </div>
  );
};