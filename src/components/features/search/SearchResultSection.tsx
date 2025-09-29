import React from 'react';

interface SearchResultSectionProps {
  title: string;
  count: number;
  loading: boolean;
  children: React.ReactNode;
  SkeletonComponent?: React.ComponentType;
  skeletonCount?: number;
}

export const SearchResultSection: React.FC<SearchResultSectionProps> = ({
  title,
  count,
  loading,
  children,
  SkeletonComponent,
  skeletonCount = 3
}) => {
  if (loading && SkeletonComponent) {
    return (
      <div className="w-full flex flex-col gap-20">
        <h2 className="text-24 font-medium text-c6">{title}</h2>
        <div className="w-full flex flex-col gap-10">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <SkeletonComponent key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && count === 0) return null;

  return (
    <div className="w-full flex flex-col gap-20">
      <h2 className="text-24 font-medium text-c6">
        {title} ({count})
      </h2>
      <div className="w-full flex flex-col gap-10">
        {children}
      </div>
    </div>
  );
};
