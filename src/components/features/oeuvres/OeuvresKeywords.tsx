import React, { useMemo } from "react";

interface KeywordsCloudProps {
  oeuvres: Array<{ id: string; keywords?: string[] }>;
  maxKeywords?: number;
}

export const OeuvresKeywords: React.FC<KeywordsCloudProps> = ({
  oeuvres,
  maxKeywords = 16,
}) => {
  // Count keyword frequencies
  const keywordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    oeuvres.forEach((oeuvre) => {
      oeuvre.keywords?.forEach((keyword) => {
        counts[keyword] = (counts[keyword] || 0) + 1;
      });
    });
    return counts;
  }, [oeuvres]);

  // Get top 3 most frequent keywords
  const topKeywords = useMemo(() => {
    return Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([keyword]) => keyword);
  }, [keywordCounts]);

  // Randomly select keywords while ensuring top 3 are included
  const selectedKeywords = useMemo(() => {
    const allKeywords = Object.entries(keywordCounts).filter(([, count]) => count > 0);
    const otherKeywords = allKeywords.filter(([keyword]) => !topKeywords.includes(keyword));

    if (allKeywords.length <= maxKeywords) return allKeywords;

    // Get random keywords from remaining pool
    const randomOthers = [...otherKeywords]
      .sort(() => 0.5 - Math.random())
      .slice(0, maxKeywords - 3);

    // Combine and shuffle
    return [
      ...allKeywords.filter(([keyword]) => topKeywords.includes(keyword)),
      ...randomOthers
    ].sort(() => 0.5 - Math.random());
  }, [keywordCounts, topKeywords, maxKeywords]);

  return (
    <section className='flex gap-50 items-end'>
      <div className='flex-1 flex flex-col justify-center gap-20 max-w-40'>
        <p className='text-c5 text-16 transition-all ease-in-out duration-200 max-w-md'>
          Mots clés les plus abordées dans nos oeuvres.
        </p>
        <h2 className='text-c6 text-64 transition-all ease-in-out duration-200'>
          Les mots-clés <br /> qui Façonnent<br /> Nos œuvres
        </h2>
      </div>
      <div className='flex flex-wrap justify-end w-1/2 gap-20'>
        {selectedKeywords.map(([keyword], index) => {
          const isTopKeyword = topKeywords.includes(keyword);
          return (
            <div key={`${keyword}-${index}`} className='p-1 bg-gradient-to-br from-c4 to-c2 bg-[length:120%] rounded-8 flex'>
              <div className="bg-c1 flex px-15 py-10 rounded-8">
                <p className={`text-16 font-medium transition-all duration-200 ${
                  isTopKeyword
                    ? 'bg-gradient-to-t from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-top'
                    : 'text-c6'
                }`}>
                  {keyword}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};