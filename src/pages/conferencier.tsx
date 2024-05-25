import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';

export const Conferencier = () => {
  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200 '>
          <div className='col-span-10'>
            <Navbar />
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
