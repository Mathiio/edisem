import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Tabs, Tab, Input, Link, Button, Card, CardBody} from '@nextui-org/react';
import { getActants, getStudents } from '@/services/Items';
import { Navbar } from '@/components/navbar/Navbar';
import { Layouts } from '@/components/utils/Layouts';

const LoginPage: React.FC = () => {
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
      const [actants, students] = await Promise.all([
        getActants(),
        getStudents()
      ]);

      console.log(actants)
    console.log(students)

      setActants(actants);
      setStudents(students);
    } catch (error) {
      console.error("Error fetching data:", error);
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

    console.log(actants)
    console.log(students)

    if (selected === 'Actant') {
      const foundActant = actants?.find((actant: { mail: string; }) => actant.mail === email);
      
      if (foundActant && password === apiKey) {
        console.log(`ID: ${foundActant.id}, Type: Actant`);
        localStorage.setItem('userId', foundActant.id);
        localStorage.setItem('userType', 'Actant');
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
      const foundStudent = students?.find((student: { mail: string; }) => student.mail === email);
      
      if (foundStudent) {
        console.log(`ID: ${foundStudent.id}, Type: Student`);
        localStorage.setItem('userId', foundStudent.id);
        localStorage.setItem('userType', 'Student');
        navigate('/');
      } else {
        alert('Email non reconnu');
      }
    }
  };

  return (
    <Layouts className='flex flex-col col-span-10 justify-center gap-25 items-center h-screen'>
      <h1 className='text-default-600 font-bold text-32'>Entrez vos identifiants de connexion</h1>
      <Tabs 
        fullWidth 
        selectedKey={selected} 
        onSelectionChange={setSelected} 
        className='max-w-lg' 
        classNames={{ 
          tabList: 'w-full gap-10 bg-default-0 rounded-8',
          cursor: 'w-full',
          tab: 'w-full bg-default-100 data-[selected=true]:bg-default-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-default-200 transition-all ease-in-out duration-200n',
          tabContent: 'group-data-[selected=true]:text-default-selected group-data-[selected=true]:font-semibold',
        }}
      >
        <Tab key='Etudiant' title='Etudiant'>
          <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-25'>
            <Input
              size='lg'
              classNames={{
                label: 'text-semibold',
                inputWrapper: 'bg-default-50 shadow-none border-1 border-default-200',
                input: 'h-[50px]',
              }}
              className='min-h-[50px] max-w-lg'
              type='email'
              label='Email'
              labelPlacement='outside'
              placeholder='Entrez votre email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type='submit' className='w-full h-[40px] bg-default-action text-default-100'>
              Se connecter
            </Button>
          </form>
        </Tab>
        
        <Tab key='Actant' title='Actant'>
          <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-25'>
            <Input 
              size='lg'
              classNames={{
                label: 'text-semibold',
                inputWrapper: 'bg-default-50 shadow-none border-1 border-default-200',
                input: 'h-[50px]',
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
                inputWrapper: 'bg-default-50 shadow-none border-1 border-default-200',
                input: 'h-[50px]',
              }}
              className='min-h-[50px]'
              type='password'
              label='Mot de passe *'
              labelPlacement='outside'
              placeholder='Entrez votre mot de passe'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type='submit' className='w-full h-[40px] bg-default-action text-default-100'>
              Se connecter
            </Button>
          </form>
        </Tab>
      </Tabs>
    </Layouts>
  );
};

export default LoginPage;