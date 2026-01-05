import { ReactNode } from 'react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

interface Stat {
  label: string;
  value: number;
}

interface PageBannerProps {
  icon?: ReactNode;
  title: string | ReactNode;
  description: string | ReactNode;
  stats?: Stat[];
  className?: string;
  edition?: boolean;
}

export const PageBanner = ({ icon, title, description, stats = [], className = '', edition = false }: PageBannerProps) => {
  const paddingClass = edition ? 'py-[10px]' : 'pt-100';

  return (
    <div className={`${paddingClass} justify-center flex items-center flex-col gap-20 relative ${className}`}>
      <div className='gap-20 justify-between flex items-center flex-col'>
        {/* Icon */}
        {icon && <div className='text-c4'>{icon}</div>}

        {/* Title */}
        <h1 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center text-center'>{title}</h1>

        {/* Description + Stats */}
        <div className='flex flex-col gap-20 justify-center items-center'>
          {/* Description */}
          <p className='text-c5 text-16 z-[12] text-center max-w-[600px]'>{description}</p>

          {/* Stats */}
          {stats.length > 0 && (
            <div className='flex gap-20 z-[12] flex-wrap justify-center'>
              {stats.map((stat, index) => (
                <StatCard key={index} label={stat.label} value={stat.value} />
              ))}
            </div>
          )}
        </div>

        {/* Animated Background */}
        <AnimatedBackground color={edition ? '#FF191D' : undefined} />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className='flex border-3 border-c3 rounded-8 p-10'>
    <p className='text-14 text-c5'>
      {value} {label}
    </p>
  </div>
);
