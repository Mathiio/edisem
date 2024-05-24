import React from 'react';

interface YouTubeVideoProps {
  videoUrl: string;
}
export const YouTubeVideo: React.FC<YouTubeVideoProps> = ({ videoUrl }) => {
  return (
    <div className='rounded-14 lg:w-full overflow-hidden'>
      <iframe
        className='lg:w-[100%] lg:h-[400px] xl:h-[450px] h-[450px] sm:h-[450px] h-[250px]'
        title='YouTube Video'
        width='100%'
        src={`https://www.youtube.com/embed/${videoUrl}`}
        frameBorder='0'
        allowFullScreen></iframe>
    </div>
  );
};
