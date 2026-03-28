import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Input, Button, Spinner } from '@heroui/react';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/Auth';
import { EyeIcon, EyeSlashIcon } from '@/components/ui/icons';
import { useNavbarReadyContext } from '@/App';

type ActantStatus = 'idle' | 'checking' | 'recognized' | 'not_found' | 'needs_registration';

export const LoginPage: React.FC = () => {
  const [selected, setSelected] = useState('Etudiant');
  const navbarContext = useNavbarReadyContext();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form States
  const [email, setEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Actant specific states
  const [actantStatus, setActantStatus] = useState<ActantStatus>('idle');
  
  // Loading & Error States
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    studentNumber?: string; 
    confirmPassword?: string;
    general?: string 
  }>({});

  const toggleVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Password complexity validation
  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
    if (!/[A-Z]/.test(pass)) return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/[0-9]/.test(pass)) return "Le mot de passe doit contenir au moins un chiffre.";
    return null;
  };

  useEffect(() => {
    if (navbarContext?.onNavbarReady) {
      navbarContext.onNavbarReady();
    }
  }, [navbarContext]);

  // Check email for Actant
  const handleActantEmailBlur = async () => {
    if (!email || !email.includes('@')) return;
    
    setActantStatus('checking');
    setErrors({});
    
    try {
      const res = await AuthService.checkEmail(email);
      if (res.success) {
        if (res.hasUser) {
          setActantStatus('recognized');
        } else if (res.exists) {
          setActantStatus('needs_registration');
        } else {
          setActantStatus('not_found');
          setErrors({ email: 'Email non reconnu comme intervenant' });
        }
      } else {
        setActantStatus('not_found');
        setErrors({ email: res.error || 'L\'adresse email n\'est pas reconnue.' });
      }
    } catch (err) {
      console.error('Check email fetch error:', err);
      setActantStatus('not_found');
      setErrors({ email: 'Impossible de contacter le serveur.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (selected === 'Actant') {
      if (!email) {
        setErrors({ email: 'L\'email est requis' });
        return;
      }
      if (!password) {
        setErrors({ password: 'Le mot de passe est requis' });
        return;
      }
      if (actantStatus === 'needs_registration') {
        const complexityError = validatePassword(password);
        if (complexityError) {
          setErrors({ password: complexityError });
          return;
        }
        if (password !== confirmPassword) {
          setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
          return;
        }
      }
    } else {
      if (!email) {
        setErrors({ email: "L'email est requis" });
        return;
      }
      if (!studentNumber) {
        setErrors({ studentNumber: 'Le numéro étudiant est requis' });
        return;
      }
    }

    setSubmitting(true);
    try {
      let response;
      if (selected === 'Actant' && actantStatus === 'needs_registration') {
        response = await AuthService.register(email, password, confirmPassword);
      } else {
        const credential = selected === 'Actant' ? password : studentNumber;
        response = await AuthService.login(email, credential, selected === 'Actant' ? 'actant' : 'student');
      }

      if (response.success && response.user && response.token) {
        login(response.user, response.token);
        navigate('/');
      } else {
        setErrors({ general: response.message || response.error || 'Échec de la connexion' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ general: 'Une erreur technique est survenue' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassNames = {
    inputWrapper: 'bg-c2 data-[hover=true]:bg-c3/50 group-data-[focus=true]:bg-c2 border-1 border-c3/50 shadow-none rounded-xl transition-all duration-200 min-h-[50px] !mt-0',
    input: 'text-c6 placeholder:text-c4/60 !mt-0',
    mainWrapper: 'w-full',
    errorMessage: '!text-[#ef4444] text-xs font-medium mt-px'
  };

  const renderInput = (
    label: string,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type: string = 'text',
    error?: string,
    onBlur?: () => void,
    endContent?: React.ReactNode,
    isDisabled: boolean = false
  ) => (
    <div className='flex flex-col gap-2'>
      <label className='text-c6 font-medium text-sm'>{label}</label>
      <Input
        classNames={inputClassNames}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isInvalid={!!error}
        errorMessage={error}
        endContent={endContent}
        isDisabled={isDisabled}
      />
    </div>
  );

  return (
    <div className='flex flex-col justify-center w-full h-screen items-center bg-c1'>
      <div className='w-[500px] shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-10 rounded-3xl flex flex-col gap-10'>
        <div className='flex flex-col items-center gap-2 text-center'>
          <h1 className='text-c6 font-medium text-3xl tracking-tight'>Connexion Edisem</h1>
          <p className='text-c4 text-base font-normal w-full'>Connectez-vous pour accéder à votre espace</p>
        </div>
        <Tabs
          fullWidth
          selectedKey={selected}
          onSelectionChange={(key) => {
            setSelected(key.toString());
            setErrors({});
            setActantStatus('idle');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }}
          classNames={{
            tabList: 'bg-c2 rounded-xl border border-c3 p-2',
            cursor: 'w-full bg-action shadow-lg rounded-lg',
            tab: 'p-4 text-c4 data-[selected=true]:text-selected font-medium transition-all',
            tabContent: 'group-data-[selected=true]:font-medium',
          }}
        >
          <Tab key='Etudiant' title='Étudiant' className='py-0'>
            <form onSubmit={handleSubmit} noValidate className='flex flex-col w-full gap-10'>
              <div className='flex flex-col gap-4'>
                {renderInput('Email', 'votre@email.com', email, (e) => setEmail(e.target.value), 'email', errors.email)}
                {renderInput('Numéro étudiant', 'ex: 20230001', studentNumber, (e) => setStudentNumber(e.target.value), 'text', errors.studentNumber)}
                {errors.general && <p className="text-[#ef4444] text-center text-sm font-medium bg-[#ef4444]/10 py-2 rounded-lg border border-[#ef4444]/20">{errors.general}</p>}
              </div>
              <div className='flex flex-col gap-4'>
                <Button type='submit' className='w-full h-[50px] bg-action text-selected font-medium text-base rounded-xl shadow-lg shadow-action/20' isLoading={submitting}>
                  {submitting ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
                <Link to="/" className="mx-auto text-center text-c4/80 hover:text-c4/60 text-sm font-normal transition-all ease-in-out duration-300">Revenir au site Edisem</Link>
              </div>
            </form>
          </Tab>
          <Tab key='Actant' title='Actant' className='py-0'>
            <form onSubmit={handleSubmit} noValidate className='flex flex-col w-full gap-10'>
              <div className='flex flex-col gap-4'>
                {renderInput('Email', 'votre@email.com', email, (e) => { setEmail(e.target.value); if (actantStatus !== 'idle') setActantStatus('idle'); setErrors({}); }, 'email', errors.email, handleActantEmailBlur, actantStatus === 'checking' ? <Spinner size="sm" /> : null)}
                <div className="flex flex-col gap-4">
                  {renderInput(actantStatus === 'needs_registration' ? 'Définir un mot de passe' : 'Mot de passe', 'Entrez votre mot de passe', password, (e) => setPassword(e.target.value), showPassword ? "text" : "password", errors.password, undefined, <button className="focus:outline-none" type="button" onClick={toggleVisibility}>{showPassword ? <EyeSlashIcon className="text-c4 text-2xl pointer-events-none" /> : <EyeIcon className="text-c4 text-2xl pointer-events-none" />}</button>, actantStatus !== 'recognized' && actantStatus !== 'needs_registration')}
                  {actantStatus === 'needs_registration' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      {renderInput('Confirmer le mot de passe', 'Répétez le mot de passe', confirmPassword, (e) => setConfirmPassword(e.target.value), showConfirmPassword ? "text" : "password", errors.confirmPassword, undefined, <button className="focus:outline-none" type="button" onClick={toggleConfirmVisibility}>{showConfirmPassword ? <EyeSlashIcon className="text-c4 text-2xl pointer-events-none" /> : <EyeIcon className="text-c4 text-2xl pointer-events-none" />}</button>)}
                    </div>
                  )}
                </div>
                {errors.general && <p className="text-[#ef4444] text-center text-sm font-medium bg-[#ef4444]/10 py-2 rounded-lg border border-[#ef4444]/20">{errors.general}</p>}
              </div>
              <div className='flex flex-col gap-4'>
                <Button type='submit' className='w-full h-[50px] bg-action text-selected font-medium text-base rounded-xl shadow-lg shadow-action/20' isLoading={submitting} isDisabled={actantStatus === 'not_found' || actantStatus === 'idle' || actantStatus === 'checking'}>
                  {submitting ? 'Traitement en cours...' : actantStatus === 'needs_registration' ? 'Créer mon compte' : 'Se connecter'}
                </Button>
                <Link to="/" className="mx-auto text-center text-c4/80 hover:text-c4/60 text-sm font-normal transition-all ease-in-out duration-300">Revenir au site Edisem</Link>
              </div>
            </form>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};