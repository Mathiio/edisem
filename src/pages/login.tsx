import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Tab, Input, Button } from '@nextui-org/react';
import { getActants, getStudents } from '@/services/Items';

import { Layouts } from '@/components/utils/Layouts';

export const LoginPage: React.FC = () => {
  const [actants, setActants] = useState<any>(null);
  const [selected, setSelected] = useState('Etudiant');
  const [students, setStudents] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [actants, students] = await Promise.all([getActants(), getStudents()]);

      setActants(actants);
      setStudents(students);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const apiKey = import.meta.env.VITE_API_KEY;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selected === 'Actant') {
      const foundActant = actants?.find((actant: { mail: string }) => actant.mail === email);
      console.log(foundActant);
      if (foundActant && password === apiKey) {
        localStorage.setItem('user', JSON.stringify(foundActant));
        navigate('/database');
      } else {
        if (!foundActant) {
          alert('Email non reconnu');
        } else {
          alert('Mot de passe incorrect');
        }
      }
    } else {
      // Cas Etudiant
      const foundStudent = students?.find((student: { mail: string }) => student.mail === email);

      if (foundStudent) {
        console.log(`ID: ${foundStudent.id}, Type: Student`);
        localStorage.setItem('user', JSON.stringify(foundStudent));
        navigate('/');
      } else {
        alert('Email non reconnu');
      }
    }
  };

  return (
    <Layouts className='flex flex-col col-span-10 justify-center gap-25 items-center '>
      <div className='flex flex-col justify-center w-full items-center gap-8 h-96'>
        <h1 className='text-500 font-medium text-24'>Connexion</h1>

        <Tabs
          fullWidth
          selectedKey={selected}
          onSelectionChange={setSelected}
          className='max-w-lg'
          classNames={{
            tabList: 'w-full gap-10 bg-0 rounded-8',
            panel: 'max-w-lg',
            cursor: 'w-full',
            tab: 'w-full bg-100 data-[selected=true]:bg-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-200 transition-all ease-in-out duration-200n',
            tabContent: 'group-data-[selected=true]:text-selected group-data-[selected=true]:font-semibold',
          }}>
          <Tab key='Etudiant' className='w-full' title='Etudiant'>
            <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-25'>
              <Input
                size='lg'
                classNames={{
                  label: 'text-semibold',
                  inputWrapper: 'bg-100 shadow-none border-1 border-200',
                  input: 'h-[50px]',
                  mainWrapper: 'w-full',
                }}
                className='min-h-[50px] '
                type='email'
                label='Email'
                labelPlacement='outside'
                placeholder='Entrez votre email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className='flex w-full flex-col pt-4 justify-center items-center'>
                <Button type='submit' className='w-fit px-3 h-[40px] bg-action text-selected '>
                  Se connecter
                </Button>
              </div>
            </form>
          </Tab>

          <Tab key='Actant' className='w-full' title='Actant'>
            <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-25'>
              <Input
                size='lg'
                classNames={{
                  label: 'text-semibold',
                  inputWrapper: 'bg-100 shadow-none border-1 border-200',
                  input: 'h-[50px]',
                  mainWrapper: 'w-full',
                }}
                className='min-h-[50px]'
                type='email'
                label='Email'
                labelPlacement='outside'
                placeholder='Entrez votre email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                size='lg'
                classNames={{
                  label: 'text-semibold',
                  inputWrapper: 'w-full bg-100 shadow-none border-1 border-200',
                  input: ' h-[50px]',
                  mainWrapper: 'w-full',
                }}
                className='min-h-[50px]'
                type='password'
                label='Mot de passe *'
                labelPlacement='outside'
                placeholder='Entrez votre mot de passe'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className='flex w-full flex-col pt-4 justify-center items-center'>
                <Button type='submit' className='w-fit px-3 h-[40px] bg-action text-selected '>
                  Se connecter
                </Button>
              </div>
            </form>
          </Tab>
        </Tabs>
      </div>
    </Layouts>
  );
};
