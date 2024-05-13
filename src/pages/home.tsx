  import { ChangeThemeButton, Navbar, EmblaCarousel } from '@/components';
  import { useDisclosure } from '@nextui-org/react';

  
  export const Home = () => {
  
    return (
      <div className='container mx-auto flex flex-col items-start	gap-6 my-6'>
        <Navbar/>
        <div className='flex space-x-4'>
            <EmblaCarousel/>
        </div>
      </div>
    );
  };
  