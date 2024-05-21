import React, { useState } from 'react';

interface ExpandableTextProps {
  text: string;
}

export const VideoDescription: React.FC<ExpandableTextProps> = ({ text }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleExpansion = () => {
    setExpanded(!expanded);
    console.log('click');
  };

  return (
    <div
      className='cursor-pointer flex flex-col bg-default-200 hover:bg-default-300 p-25 rounded-8 gap-10 transition-all ease-in-out duration-200'
      onClick={toggleExpansion}>
      <div
        className='text-16 text-default-500 font-normal transition-all ease-in-out duration-200'
        style={{
          lineHeight: '120%',
          maxHeight: expanded ? 'none' : '60px',
          overflow: 'hidden',
        }}>
        {text}
      </div>

      <div
        className='text-16 text-default-action font-bold transition-all ease-in-out duration-200'
        onClick={toggleExpansion}>
        {expanded ? 'moins' : '...affichez plus'}
      </div>
    </div>
  );
};
