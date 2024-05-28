import React from 'react';
import { UserIcon } from '../Utils/icons';
import { MiniCardCoferencier } from '../conference/ConferenceCards';
import { Button } from '@nextui-org/react';

export const HighlightSection = () => {
  return (
    <div className='w-full flex flex-row gap-50'>
      <div className='w-1/2 flex flex-col gap-25 justify-center'>
        <h1 className='text-32 font-semibold text-default-600'>
          Puissances du faux dans les arts trompeurs et l’écosystème socionumérique
        </h1>
        <p className='text-default-600'>
          Ce séminaire international de cycles supérieurs vise à explorer les mécanismes à l’œuvre dans les arts
          trompeurs et l’espace informationnel de l’écosystème socionumérique qui activent les puissances du faux,
          prenant place dans une ère de post-vérité.
        </p>
        <div className='flex flex-row gap-10'>
          <MiniCardCoferencier Name='Renée Bourassa' />
          <MiniCardCoferencier Name='Jean-Marc Larrue' />
          <MiniCardCoferencier Name='Samuel Szoniecky' />
        </div>
        <Button
          startContent={<UserIcon size={11} />}
          className='w-fit h-[45px] bg-default-action rounded-8 text-default-selected'>
          Découvrir
        </Button>
      </div>
      <div
        className='w-1/2 h-[400px] rounded-8 bg-cover bg-center'
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg')",
        }}></div>
    </div>
  );
};
