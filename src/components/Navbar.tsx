import {
    Image,
  } from '@/theme/components';
import { useState } from 'react';
import { Input } from '@nextui-org/react';
import Logo from '@/assets/svg/logo.svg';
import SearchIcon from '@/assets/svg/search.svg';
import MoonIcon from '@/assets/svg/moon.svg';
import CreditIcon from '@/assets/svg/credit.svg';
import SunIcon from '@/assets/svg/sun.svg';
import {Kbd} from "@nextui-org/kbd";
import {Button} from "@nextui-org/react";
import { Link } from "@nextui-org/link";



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
        <div>
          <Input
            type="email"
            placeholder="Recherche avancée..."
            labelPlacement="outside"
            startContent={
              <Image width={40} src={SearchIcon} alt='Barre de recherche' />
            }
            endContent={
              <Kbd keys={["command"]}>K</Kbd>
            }
          />
          <Link>
            <Image width={40} src={CreditIcon} alt='Afficher les crédits' />
          </Link>  
          <Link>
            <Image width={40} src={MoonIcon} alt='Changement du thème' />
          </Link>   
        </div>
    </nav>
  );
};
