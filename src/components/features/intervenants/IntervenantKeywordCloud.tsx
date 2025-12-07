import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getAllConfs } from '@/services/Items';
import { SearchModal, SearchModalRef } from '@/components/features/search/SearchModal';
import { Tooltip } from '@heroui/react';

interface IntervenantKeywordCloudProps {
  intervenantConfs: any[];
}

interface KeywordStats {
  id: string;
  title: string;
  localCount: number;
  globalCount: number;
}

export const IntervenantKeywordCloud: React.FC<IntervenantKeywordCloudProps> = ({ intervenantConfs }) => {
  const [keywordStats, setKeywordStats] = useState<KeywordStats[]>([]);
  const [loading, setLoading] = useState(true);
  const searchModalRef = useRef<SearchModalRef>(null);

  useEffect(() => {
    const calculateStats = async () => {
      setLoading(true);
      try {
        // Calculate Local Counts
        const localCounts = new Map<string, number>();
        intervenantConfs.forEach((conf) => {
          if (Array.isArray(conf.motcles)) {
            conf.motcles.forEach((kw: any) => {
              const id = typeof kw === 'object' ? kw.id : kw;
              if (id) {
                localCounts.set(String(id), (localCounts.get(String(id)) || 0) + 1);
              }
            });
          }
        });

        // Fetch Global Data
        const allConfs = await getAllConfs();
        const globalCounts = new Map<string, { count: number; title: string }>();

        allConfs.forEach((conf: any) => {
            if (Array.isArray(conf.motcles)) {
                conf.motcles.forEach((kw: any) => {
                    const id = typeof kw === 'object' ? kw.id : kw;
                    const title = typeof kw === 'object' ? kw.title : kw;
                    if (id) {
                        const current = globalCounts.get(String(id)) || { count: 0, title };
                        globalCounts.set(String(id), { count: current.count + 1, title: current.title || title });
                    }
                });
            }
        });

        // Build & Filter Dataset
        const allStats: KeywordStats[] = [];

        globalCounts.forEach((val, id) => {
            const localCount = localCounts.get(id) || 0;
            allStats.push({
                id,
                title: val.title,
                localCount,
                globalCount: val.count
            });
        });

        // Limit to 60 words in total to GUARANTEE strictly no overflow.
        // IF overflow -> buffers get hidden -> active words hit edge.
        // Solution: Fit content < 300px.
        
        allStats.sort((a, b) => b.globalCount - a.globalCount); // Sort by popularity first

        const activeWords = allStats.filter(s => s.localCount > 0);
        const passiveWords = allStats.filter(s => s.localCount === 0);

        // Deduplicate active words from "allStats" list notionally
        // We want a total list of 60.
        
        // Take active words first.
        let finalSelection = [...activeWords];
        
        // Fill remaining slots with top passive words.
        const limitCount = 60;
        const slotsRemaining = limitCount - activeWords.length;
        if (slotsRemaining > 0) {
            finalSelection = [...finalSelection, ...passiveWords.slice(0, slotsRemaining)];
        } else {
            // Edge case: if user has > 60 distinctive words, we reduce active list to top 60 global.
            finalSelection = finalSelection.slice(0, limitCount);
        }

        // "Sandwich" Sorting for Safe Zones
        // Top Buffer: 15 words
        // Bottom Buffer: 15 words
        // Middle: Remaining words
        
        const activeInSelection = finalSelection.filter(s => s.localCount > 0);
        const passiveInSelection = finalSelection.filter(s => s.localCount === 0);

        // We need at least 30 passive words to make clean buffers.
        // Randomize passive words to pick buffers.
        const shuffledPassive = passiveInSelection.sort(() => Math.random() - 0.5);
        
        const topBufferCount = 15;
        const bottomBufferCount = 15;
        
        const topBuffer = shuffledPassive.slice(0, topBufferCount);
        const bottomBuffer = shuffledPassive.slice(topBufferCount, topBufferCount + bottomBufferCount);
        const remainingPassive = shuffledPassive.slice(topBufferCount + bottomBufferCount);
        
        // Middle pool = All Active + Remaining Passive
        const middlePool = [...activeInSelection, ...remainingPassive].sort(() => Math.random() - 0.5);

        const orderedStats = [...topBuffer, ...middlePool, ...bottomBuffer];
        
        setKeywordStats(orderedStats);

      } catch (error) {
        console.error("Error generating keyword cloud:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [intervenantConfs]);

  // Max Global Count for Sizing Context
  const maxGlobalCount = useMemo(() => {
        return Math.max(...keywordStats.map(k => k.globalCount), 0);
  }, [keywordStats]);

  const getFontSize = (count: number, max: number) => {
      const minSize = 14; 
      const maxSize = 42; // Drastically reduced from 64 to ensure fit
      if (max === 0) return minSize;
      
      return minSize + ((count / max) * (maxSize - minSize));
  };


  if (loading) {
    return <div className="animate-pulse h-[300px] bg-c2/50 rounded-12 w-full"></div>;
  }

  if (keywordStats.length === 0) {
    return <p className="text-c5 italic">Aucun mot clé disponible.</p>;
  }

  return (
    <div className="relative w-full h-[300px] overflow-hidden group rounded-20 border border-c3 bg-c1">
      {/* Gradient Masks */}
      {/* z-[20] to strictly cover ALL text (words max z-15) but stay below Modals (usually 50+) */}
      <div className="absolute top-0 left-0 w-full h-60 bg-gradient-to-b from-c1 to-transparent z-[20] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-60 bg-gradient-to-t from-c1 to-transparent z-[20] pointer-events-none"></div>

      {/* Block with text-center. */}
      {/* Wrap in Flex Column to Center Vertically in case content < height */}
      <div className="flex flex-col justify-center h-full w-full">
         <div className="block text-center px-20 py-4 w-full overflow-hidden leading-[0.9] select-none">
            {keywordStats.map((stat, index) => {
            const fontSize = getFontSize(stat.globalCount, maxGlobalCount);
            const isUsedByIntervenant = stat.localCount > 0;
            
            // Z-Index: Small > Big. Range ~15 down to ~5. 
            // Gradient is 20, so it always covers everything.
            const zIndex = Math.floor(19 - (fontSize / 3));  
            
            const colorClass = isUsedByIntervenant 
                ? "text-action hover:text-action-focus" 
                : "text-c4/20 hover:text-c5/60 blur-[0.5px] hover:blur-none transition-all duration-300";

            return (
                <Tooltip 
                key={`${stat.id}-${index}`}
                content={
                    <div className="p-10 gap-2 flex flex-col pointer-events-none ">
                      <p className="text-16 font-bold uppercase">{stat.title}</p>
                      <div className="flex flex-col gap-1">
                        {isUsedByIntervenant ? (
                            <p className="text-12 text-c5">Utilisé {stat.localCount} fois par cet intervenant</p>
                        ) : (
                            <p className="text-12 text-c5">Non utilisé par cet intervenant</p>
                        )}
                        <p className="text-10 opacity-60">Total global: {stat.globalCount}</p>
                      </div>
                    </div>
                }
                className="bg-c2 text-c6 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] border-c3 border-2"
                delay={0}
                closeDelay={0}
                >
                <button
                    onClick={() => searchModalRef.current?.openWithSearch(stat.title)}
                    className={`
                        relative inline-block
                        font-black uppercase tracking-tight 
                        transition-all duration-300 ease-out
                        mx-[6px] my-0 align-middle
                        ${colorClass}
                    `}
                    style={{ 
                        fontSize: `${fontSize}px`,
                        zIndex: zIndex
                    }}
                >
                    {stat.title}
                </button>
                </Tooltip>
            );
            })}
            <span className="inline-block w-full"></span>
        </div>
      </div>
      
      <SearchModal ref={searchModalRef} notrigger />
    </div>
  );
};
