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
    <div className='flex flex-col bg-default-200 p-sm rounded-sm gap-vs'>
      <div
        className='text-other '
        style={{ maxHeight: expanded ? 'none' : '65px', overflow: 'hidden' }}
        onClick={toggleExpansion}>
        {text}
      </div>

      <div className=' text-secondary-500 text-other font-semibold cursor-pointer' onClick={toggleExpansion}>
        {expanded ? 'moins' : '...affichez plus'}
      </div>
    </div>
  );
};
