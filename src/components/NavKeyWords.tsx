import { Button } from "@nextui-org/react";

export const NavKeyWords = () => {
  return (
    <div className=" w-full flex gap-3 overflow-hidden">
      <Button className="bg-default-50 border-2 border-default-500 hover:border-secondary-400 hover:opacity-100 h-8 text-default-500 hover:text-secondary-400"> Press me </Button>
    </div>
  );
};
/*
  <Button className='bg-default-50 border-2 border-default-500 hover:border-secondary-400 h-8 text-default-500 hover:text-secondary-500'>

        <p className="text-default-600 text-base">Recherche avancée... </p>

      </Button>
*/