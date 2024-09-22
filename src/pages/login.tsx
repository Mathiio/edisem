import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '@nextui-org/react';

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_API_KEY; // Chargement de la clé API depuis .env

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Vérification du mot de passe avec la clé API
    if (password === apiKey) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/database');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  return (
    <div className='flex flex-col gap-50 justify-center items-center h-screen'>
      <h1 className='text-default-600 font-bold text-32'>Bienvenue</h1>
      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-25'>
        <Input
          size='lg'
          classNames={{
            label: 'text-semibold',
            inputWrapper: 'bg-default-50 shadow-none border-1 border-default-200',
            input: 'h-[50px] ',
          }}
          className='min-h-[50px]'
          type='password'
          label='Mot de passe *'
          labelPlacement='outside'
          placeholder={`Entrez votre mot de passe`}
          value={password} // Ajout de la valeur pour l'input
          onChange={(e) => setPassword(e.target.value)} // Mise à jour de l'état
        />
        <Button type='submit' className='w-full h-[40px] bg-default-action text-default-100 '>
          Se connecter
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
