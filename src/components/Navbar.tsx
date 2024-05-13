import {
    Image,
  } from '@/theme/components';
import { useState } from 'react';
import { Input } from '@nextui-org/react';
import Logo from '@/assets/svg/logo.svg';

export const Navbar = () => {
  return (
    <nav className="w-full flex justify-between">
        <a href="/" className='flex space-x-4'>
            <Image width={40} src={Logo} alt='Logo' />
            <div className="flex column justify-between">
                <h2>Séminaire ARCANES</h2>
                <p>Images trompeuses et modèles d'intelligence artificielle</p>
            </div>
        </a>
    </nav>
  );
};
