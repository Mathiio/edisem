import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Tab, Input, Button, Spinner } from '@heroui/react';
import { getActants } from '@/services/Items';
import { getStudentsForLogin, Student } from '@/services/StudentSpace';
import { useAuth } from '@/hooks/useAuth';

import { Layouts } from '@/components/layout/Layouts';

export const LoginPage: React.FC = () => {
  const [actants, setActants] = useState<any>(null);
  const [selected, setSelected] = useState('Etudiant');
  const [students, setStudents] = useState<Student[] | null>(null);
  const [email, setEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Utiliser getStudentsForLogin qui retourne aussi l'omekaUserId
      const [actantsData, studentsData] = await Promise.all([getActants(), getStudentsForLogin()]);

      setActants(actantsData);
      // S'assurer que c'est un tableau
      setStudents(Array.isArray(studentsData) ? studentsData : []);
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
    setSubmitting(true);

    // Utiliser requestAnimationFrame pour forcer le rendu du loader avant d'exécuter la logique
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        try {
          if (selected === 'Actant') {
            const foundActant = actants?.find((actant: { mail: string }) => actant.mail === email);
            if (foundActant && password === apiKey) {
              login(foundActant, String(foundActant.id));
              navigate('/');
            } else {
              if (!foundActant) {
                alert('Email non reconnu');
              } else {
                alert('Mot de passe incorrect');
              }
              setSubmitting(false);
            }
          } else {
            // Rechercher l'étudiant par email ET numéro étudiant
            const foundStudent = students?.find((student) => student.mail === email && student.studentNumber === studentNumber);
            if (foundStudent) {
              // Mapper Student vers UserData et passer l'omekaUserId pour que o:owner soit correctement défini
              const userData = {
                id: foundStudent.id,
                firstname: foundStudent.firstname,
                lastname: foundStudent.lastname,
                picture: foundStudent.picture || undefined,
                type: 'student' as const,
                omekaUserId: foundStudent.omekaUserId,
              };
              login(userData, String(foundStudent.id), foundStudent.omekaUserId);
              navigate('/');
            } else {
              // Vérifier si c'est l'email ou le numéro qui ne correspond pas
              const studentByEmail = students?.find((student) => student.mail === email);
              if (!studentByEmail) {
                alert('Email non reconnu');
              } else {
                alert('Numéro étudiant incorrect');
              }
              setSubmitting(false);
            }
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('Erreur lors de la connexion');
          setSubmitting(false);
        }
      });
    });
  };

  return (
    <Layouts className='flex flex-col col-span-10 justify-center gap-25 items-center '>
      <div className='flex flex-col justify-center w-full items-center gap-8 h-96'>
        <h1 className='text-c6 font-medium text-24'>Connexion</h1>

        <Tabs
          fullWidth
          selectedKey={selected}
          onSelectionChange={(key) => setSelected(key.toString())}
          className='max-w-lg'
          classNames={{
            tabList: 'w-full gap-10 bg-c0 rounded-8',
            panel: 'max-w-lg',
            cursor: 'w-full',
            tab: 'w-full bg-c2 data-[selected=true]:bg-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-c3 transition-all ease-in-out duration-200n',
            tabContent: 'group-data-[selected=true]:text-selected group-data-[selected=true]:font-semibold',
          }}>
          <Tab key='Etudiant' className='w-full' title='Etudiant'>
            <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-25'>
              <Input
                size='lg'
                classNames={{
                  label: 'text-semibold !text-c6 text-24',
                  inputWrapper: 'bg-c2 shadow-none border-1 border-200',
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
              <Input
                size='lg'
                classNames={{
                  label: 'text-semibold !text-c6 text-24',
                  inputWrapper: 'bg-c2 shadow-none border-1 border-200',
                  input: 'h-[50px]',
                  mainWrapper: 'w-full',
                }}
                className='min-h-[50px]'
                type='text'
                label='Numéro étudiant'
                labelPlacement='outside'
                placeholder='Entrez votre numéro étudiant'
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
              />
              <div className='flex w-full flex-col pt-4 justify-center items-center'>
                <Button type='submit' className='w-fit px-3 h-[40px] bg-action text-selected' isLoading={submitting} spinner={<Spinner size='sm' color='current' />}>
                  {submitting ? 'Connexion...' : 'Se connecter'}
                </Button>
              </div>
            </form>
          </Tab>

          <Tab key='Actant' className='w-full' title='Actant'>
            <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-lg gap-25'>
              <Input
                size='lg'
                classNames={{
                  label: 'text-semibold !text-c6 text-24',
                  inputWrapper: 'bg-c2 shadow-none border-1 border-200',
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
                  label: 'text-semibold !text-c6 text-24',
                  inputWrapper: 'w-full bg-c2 shadow-none border-1 border-200',
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
                <Button type='submit' className='w-fit px-3 h-[40px] bg-action text-selected' isLoading={submitting} spinner={<Spinner size='sm' color='current' />}>
                  {submitting ? 'Connexion...' : 'Se connecter'}
                </Button>
              </div>
            </form>
          </Tab>
        </Tabs>
      </div>
    </Layouts>
  );
};
