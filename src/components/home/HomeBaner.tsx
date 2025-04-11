import { MagicIcon } from '@/components/Utils/icons';
import { Link } from 'react-router-dom';

export const HomeBaner: React.FC = () => {
    return (
      <div className="py-50 justify-center flex items-center flex-col gap-20">
        <div className="gap-20 justify-between flex items-center flex-col">
          {/* <div className="border-2 border-c3 py-2 px-4 rounded-12">
            <p className="text-14 text-extralight bg-gradient-to-r from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-left">Innovation et découvertes au service de la recherche</p>
          </div> */}
          <h1 className="text-64 font-medium flex flex-col items-center transition-all ease-in-out duration-200">
            <span className="text-c6">Edisem, plongez dans</span>
            <span className="bg-gradient-to-r from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-left">une nouvelle ère de recherche</span>
          </h1>
          {/* <p className="text-c4 text-16">Explorer, Connecter, Découvrir et plus.</p> */}
        </div>
        <h1 className='text-64 font-medium flex flex-col items-center transition-all ease-in-out duration-200'>
          <span className='text-c6'>Edisem, plongez dans</span>
          <span className='bg-gradient-to-r from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-left'>
            une nouvelle ère de recherche
          </span>
        </h1>
        <p className='text-c4 text-16'>Explorer, Connecter, Découvrir et plus.</p>
      </div>
      <Link
        className='bg-c2 py-3 px-6 flex rounded-12 h-auto hover:bg-c3 transition-all ease-in-out duration-200 items-center gap-10'
        to='/visualisation'>
        <span className='text-16 bg-gradient-to-r from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-left'>
          Recherche par datavisualisation...
        </span>
        <MagicIcon size={16} className='text-c4' />
      </Link>
    </div>
  );
};
