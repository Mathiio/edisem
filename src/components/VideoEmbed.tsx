import React from 'react';

interface YouTubeVideoProps {
  videoUrl: string;
}
export const YouTubeVideo: React.FC<YouTubeVideoProps> = ({ videoUrl }) => {
  return (
    <div className='rounded-14 lg:w-full overflow-hidden'>
      <iframe
        className='lg:w-[100%]'
        title='YouTube Video'
        width='100%'
        height='500'
        src={`https://www.youtube.com/embed/${videoUrl}`}
        frameBorder='0'
        allowFullScreen></iframe>
    </div>
  );
};
