import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Input, Button, Spinner } from '@heroui/react';
import { getStudentsForLogin, getActantsForLogin, Student, Actant } from '@/services/StudentSpace';
import { useAuth } from '@/hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@/components/ui/icons';
import { useNavbarReadyContext } from '@/App';

export const LoginPage: React.FC = () => {
  const [actants, setActants] = useState<Actant[] | null>(null);
  const [selected, setSelected] = useState('Etudiant');
  const [students, setStudents] = useState<Student[] | null>(null);
  const navbarContext = useNavbarReadyContext();
  
  // Form States
  const [email, setEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  // Loading & Error States
  const [, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; studentNumber?: string; general?: string }>({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [actantsData, studentsData] = await Promise.all([getActantsForLogin(), getStudentsForLogin()]);
      setActants(Array.isArray(actantsData) ? actantsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      if (navbarContext?.onNavbarReady) {
        navbarContext.onNavbarReady();
      }
    }
  }, [navbarContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const apiKey = import.meta.env.VITE_API_KEY;

  // Retourne les erreurs sans appeler setErrors — évite les conflits de batching React
  const getValidationErrors = () => {
    const newErrors: { email?: string; password?: string; studentNumber?: string; general?: string } = {};
    if (!email) newErrors.email = "L'email est requis";
    if (selected === 'Actant') {
      if (!password) newErrors.password = 'Le mot de passe est requis';
    } else {
      if (!studentNumber) newErrors.studentNumber = 'Le numéro étudiant est requis';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Valider sans toucher au state
    const validationErrors = getValidationErrors();

    // 2. Si erreurs de validation : les afficher et stopper
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // 3. Champs valides : effacer toutes les erreurs et lancer le chargement
    setErrors({});
    setSubmitting(true);

    // Délai artificiel pour montrer le spinner
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (selected === 'Actant') {
        const foundActant = actants?.find((actant) => actant.mail === email);

        if (foundActant && password === apiKey) {
          let firstname = foundActant.firstname;
          let lastname = foundActant.lastname;
          if (!firstname && !lastname && foundActant.title) {
            const nameParts = foundActant.title.split(' ');
            firstname = nameParts[0] || '';
            lastname = nameParts.slice(1).join(' ') || '';
          }

          const userData = {
            id: foundActant.id,
            firstname,
            lastname,
            picture: foundActant.picture || undefined,
            type: 'actant' as const,
            omekaUserId: foundActant.omekaUserId,
          };
          login(userData, String(foundActant.id), foundActant.omekaUserId);
          navigate('/');
        } else {
          if (!foundActant) {
            setErrors({ email: 'Email non reconnu' });
          } else {
            setErrors({ password: 'Mot de passe incorrect' });
          }
          setSubmitting(false);
        }
      } else {
        // Etudiant login
        const foundStudent = students?.find(
          (student) => student.mail === email && student.studentNumber === studentNumber
        );

        if (foundStudent) {
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
          const studentByEmail = students?.find((student) => student.mail === email);

          if (!studentByEmail) {
            setErrors({ email: 'Email non reconnu' });
          } else {
            setErrors({ studentNumber: 'Numéro étudiant incorrect' });
          }
          setSubmitting(false);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Erreur lors de la connexion' });
      setSubmitting(false);
    }
  };

  const inputClassNames = {
    inputWrapper: 'bg-c2 data-[hover=true]:bg-c3/50 group-data-[focus=true]:bg-c2 border-1 border-c3/50 shadow-none rounded-12 transition-all duration-200 min-h-[50px] !mt-0',
    input: 'text-c6 placeholder:text-c4/60 !mt-0',
    mainWrapper: 'w-full',
    errorMessage: '!text-[#ef4444] text-12 font-medium mt-1'
  };

  const renderInput = (
    label: string,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type: string = 'text',
    error?: string,
    endContent?: React.ReactNode
  ) => (
    <div className='flex flex-col gap-2'>
      <label className='text-c6 font-medium text-14'>{label}</label>
      <Input
        classNames={inputClassNames}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        isInvalid={!!error}
        errorMessage={error}
        endContent={endContent}
      />
    </div>
  );

  return (
    <div className='flex flex-col justify-center w-full h-screen items-center bg-c1'>
      {/* Card Container */}
      <div className='w-[500px] shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-40 rounded-24 flex flex-col gap-40'>
        <div className='flex flex-col items-center gap-2 text-center'>
          <h1 className='text-c6 font-semibold text-32 tracking-tight'>Connexion Edisem</h1>
          <p className='text-c4 text-16 font-light w-full'>
            Connectez-vous pour accéder à votre espace
          </p>
        </div>
        <Tabs
          fullWidth
          selectedKey={selected}
          onSelectionChange={(key) => {
            setSelected(key.toString());
            setErrors({});
          }}
          classNames={{
            tabList: 'bg-c2 rounded-14 border border-c3 p-2',
            cursor: 'w-full bg-action shadow-lg rounded-10',
            tab: 'p-4 text-c4 data-[selected=true]:text-selected font-medium transition-all',
            tabContent: 'group-data-[selected=true]:font-semibold',
          }}
        >
          <Tab key='Etudiant' title='Étudiant' className='py-0'>
            <form onSubmit={handleSubmit} noValidate className='flex flex-col w-full gap-40'>
              <div className='flex flex-col gap-4'>
                {renderInput(
                  'Email', 
                  'votre@email.com', 
                  email, 
                  (e) => setEmail(e.target.value), 
                  'email', 
                  errors.email
                )}
                {renderInput(
                  'Numéro étudiant', 
                  'ex: 20230001', 
                  studentNumber, 
                  (e) => setStudentNumber(e.target.value), 
                  'text', 
                  errors.studentNumber
                )}
              
                {errors.general && (
                  <p className="text-[#ef4444] text-center text-14 font-medium bg-[#ef4444]/10 py-2 rounded-8 border border-[#ef4444]/20">
                    {errors.general}
                  </p>
                )}
              </div>
              <div className='flex flex-col gap-4'>
                <Button 
                  type='submit' 
                  className='w-full h-[50px] bg-action text-selected font-semibold text-16 rounded-12 shadow-lg shadow-action/20'
                  isLoading={submitting}
                  startContent={submitting ? <Spinner size='sm' color='current' /> : null}
                  spinner={<></>}
                >
                  {submitting ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
                <Link to="/" className="mx-auto text-center text-c4/80 hover:text-c4/60 text-14 font-normal transition-all ease-in-out duration-300">Revenir au site Edisem</Link>
              </div>
            </form>
          </Tab>

          <Tab key='Actant' title='Actant' className='py-0'>
            <form onSubmit={handleSubmit} noValidate className='flex flex-col w-full gap-40'>
              <div className='flex flex-col gap-4'>
                {renderInput(
                  'Email', 
                  'votre@email.com', 
                  email, 
                  (e) => setEmail(e.target.value), 
                  'email', 
                  errors.email
                )}
                {renderInput(
                  'Mot de passe', 
                  'Entrez votre mot de passe', 
                  password, 
                  (e) => setPassword(e.target.value), 
                  isVisible ? "text" : "password", 
                  errors.password,
                  <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                    {isVisible ? (
                      <EyeSlashIcon className="text-c4 text-2xl pointer-events-none" />
                    ) : (
                      <EyeIcon className="text-c4 text-2xl pointer-events-none" />
                    )}
                  </button>
                )}

                {errors.general && (
                  <p className="text-[#ef4444] text-center text-14 font-medium bg-[#ef4444]/10 py-2 rounded-8 border border-[#ef4444]/20">
                    {errors.general}
                  </p>
                )}
              </div>
              <div className='flex flex-col gap-4'>
                <Button 
                  type='submit' 
                  className='w-full h-[50px] bg-action text-selected font-semibold text-16 rounded-12 shadow-lg shadow-action/20'
                  isLoading={submitting}
                  startContent={submitting ? <Spinner size='sm' color='current' /> : null}
                  spinner={<></>}
                >
                  {submitting ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
                <Link to="/" className="mx-auto text-center text-c4/80 hover:text-c4/60 text-14 font-normal transition-all ease-in-out duration-300">Revenir au site Edisem</Link>
              </div>
            </form>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};