import React, { useEffect, useState, useMemo } from 'react';
import { Layouts } from '@/components/layout/Layouts';
import * as Items from '@/services/Items';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Skeleton } from '@heroui/react';
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { ScatterChart } from '@mui/x-charts/ScatterChart';

interface KeywordMetric {
  id: string;
  title: string;
  count: number;
  types: Record<string, number>;
  diversityScore: number; // Number of distinct content types
  [key: string]: any;
}

interface CoOccurrence {
  pair: [string, string]; // [Keyword Title A, Keyword Title B]
  count: number;
}

export const KeywordsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<KeywordMetric[]>([]);
  const [coOccurrences, setCoOccurrences] = useState<CoOccurrence[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          keywords,
          confs,
          oeuvres,
          citations,
          experimentations,
          objetsTechno,
          docsScientifiques,
          recitsMediatiques
        ] = await Promise.all([
          Items.getKeywords(),
          Items.getAllConfs(),
          Items.getOeuvres(),
          Items.getCitations(),
          Items.getExperimentations(),
          Items.getRecitsTechnoIndustriels(),
          Items.getRecitsScientifiques(),
          Items.getRecitsMediatiques(),
        ]);

        // Keyword Map Initialization
        const keywordMap = new Map<string, KeywordMetric>();
        keywords.forEach((k: any) => {
          keywordMap.set(String(k.id), {
            id: String(k.id),
            title: k.title || `Keyword ${k.id}`,
            count: 0,
            types: {}, // will store counts per type
            diversityScore: 0
          });
        });

        const pairMap = new Map<string, number>();

        // Helper to process items
        const processItem = (item: any, typeName: string) => {
          let itemKeywords: string[] = [];
          
          // Harvest all keywords from fields
          const extractIds = (field: any) => {
             if (Array.isArray(field)) {
               return field.map((k: any) => typeof k === 'object' ? String(k.id) : String(k));
             } else if (typeof field === 'string') {
               return field.split(',').map(s => s.trim());
             }
             return [];
          };

          itemKeywords = [
             ...extractIds(item.keywords),
             ...extractIds(item.motcles),
             ...extractIds(item.concepts)
          ];

          // Deduplicate keywords for this item
          const uniqueItemKeywords = Array.from(new Set(itemKeywords));

          // 1. Update Keyword Metrics
          uniqueItemKeywords.forEach(kid => {
            const metric = keywordMap.get(kid);
            if (metric) {
              metric.count++;
              metric.types[typeName] = (metric.types[typeName] || 0) + 1;
            }
          });

          // 2. Co-occurrence Analysis (Pairwise)
          for (let i = 0; i < uniqueItemKeywords.length; i++) {
            for (let j = i + 1; j < uniqueItemKeywords.length; j++) {
              const k1 = uniqueItemKeywords[i];
              const k2 = uniqueItemKeywords[j];
              
              // Sort ids to ensure A-B is same as B-A
              const [idA, idB] = [k1, k2].sort();
              const pairKey = `${idA}|${idB}`;
              
              // Only count if both exist in our keyword set (ignore unknowns)
              if (keywordMap.has(idA) && keywordMap.has(idB)) {
                  pairMap.set(pairKey, (pairMap.get(pairKey) || 0) + 1);
              }
            }
          }
        };

        // --- BATCH PROCESS ---
        const sources = [
          { data: confs, type: 'Conference' },
          { data: oeuvres, type: 'Oeuvre' },
          { data: citations, type: 'Citation' },
          { data: experimentations, type: 'Experimentation' },
          { data: objetsTechno, type: 'ObjetTechno' },
          { data: docsScientifiques, type: 'DocScientifique' },
          { data: recitsMediatiques, type: 'RecitMediatique' },
        ];

        sources.forEach(source => {
           source.data.forEach((item: any) => processItem(item, source.type));
        });

        // --- FINALIZE METRICS ---
        const metricsArray = Array.from(keywordMap.values()).map(m => ({
          ...m,
          diversityScore: Object.keys(m.types).length // How many distinct sources?
        })).sort((a, b) => b.count - a.count);

        setMetrics(metricsArray);

        // --- FINALIZE CO-OCCURRENCES ---
        const topPairs = Array.from(pairMap.entries())
          .map(([key, count]) => {
            const [idA, idB] = key.split('|');
            return {
              pair: [keywordMap.get(idA)?.title || idA, keywordMap.get(idB)?.title || idB] as [string, string],
              count
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 50); // Keep top 50 pairs

        setCoOccurrences(topPairs);

      } catch (err) {
        console.error("Analysis Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const topKeywords = useMemo(() => metrics.slice(0, 20), [metrics]);

  // Scatter Data: Diversity (X) vs Frequency (Y)
  // We want to see: High Diversity + High Frequency (Core themes)
  // High Diversity + Low Frequency (Bridges?)
  // Low Diversity + High Frequency (Niche/Specific)
  const scatterData = useMemo(() => {
    return metrics
      .filter(m => m.count > 0) // Filter orphans for this chart
      .map((m) => ({
        id: m.id,
        x: m.diversityScore, // Diversity
        y: m.count,         // Frequency
        title: m.title
    }));
  }, [metrics]);

  // Distribution Data (e.g. 0 uses, 1-5, 5-10, 10+)
  const distributionData = useMemo(() => {
    let zero = 0;
    let oneToFive = 0;
    let fiveToTen = 0;
    let tenPlus = 0;

    metrics.forEach(m => {
      if (m.count === 0) zero++;
      else if (m.count <= 5) oneToFive++;
      else if (m.count <= 10) fiveToTen++;
      else tenPlus++;
    });

    return [
      { id: 0, value: zero, label: '0 (Orphelins)', color: '#ef4444' }, // red
      { id: 1, value: oneToFive, label: '1-5 (Rare)', color: '#f59e0b' }, // orange
      { id: 2, value: fiveToTen, label: '5-10 (Moyen)', color: '#3b82f6' }, // blue
      { id: 3, value: tenPlus, label: '10+ (Fréquent)', color: '#10b981' }, // green
    ];
  }, [metrics]);

  // Advice Generator
  const insights = useMemo(() => {
      const tips = [];
      const orphansCount = metrics.filter(m => m.count === 0).length;
      const total = metrics.length;
      
      if (orphansCount > total * 0.1) {
          tips.push({
              type: 'warning',
              title: 'Nettoyage nécessaire',
              desc: `${orphansCount} mots-clés sont inutilisés. Certains mots-clés sont à supprimer ou à fusionner.`
          });
      }

      const lowDiversityHighFreq = metrics.filter(m => m.count > 10 && m.diversityScore <= 1).length;
      if (lowDiversityHighFreq > 5) {
          tips.push({
              type: 'info',
              title: 'Mots-clés de niche',
              desc: `${lowDiversityHighFreq} mots-clés sont très fréquents mais utilisés dans un seul type de contenu. Sont-ils trop spécifiques ?`
          });
      }

      const highDiversity = metrics.filter(m => m.diversityScore >= 4).length;
      if (highDiversity < 5) {
           tips.push({
              type: 'tip',
              title: 'Manque de transversalité',
              desc: "Peu de mots-clés lient vos différents types de contenus (Conférences, Œuvres, etc.). Essayez d'utiliser des thèmes plus globaux."
          });
      }

      return tips;
  }, [metrics]);

  if (loading) { /* Skeleton... */ return <Layouts className='pt-50'><Skeleton className="w-full h-[500px]" /></Layouts>; }

  return (
    <Layouts className='col-span-12 flex flex-col gap-50 pt-50 max-w-[1600px] mx-auto px-20'>
      <div className="flex flex-col gap-10">
        <h1 className="text-48 font-bold text-c6">Analyse Complète des Mots-Clés</h1>
        <p className="text-18 text-c5">
            Vue d'ensemble, typologie, co-occurrences et conseils d'optimisation.
        </p>
      </div>

        {/* SECTION 1: CONSEILS AUTOMATIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3">
            {insights.length > 0 ? insights.map((insight, i) => (
                <div key={i} className={`p-20 rounded-20 border-2 flex flex-col gap-10 ${insight.type === 'warning' ? 'bg-red-900/10 border-c3' : insight.type === 'info' ? 'bg-blue-900/10 border-blue-500/30' : 'bg-green-900/10 border-green-500/30'}`}>
                    <h3 className={`text-18 font-bold ${insight.type === 'warning' ? 'text-c6' : insight.type === 'info' ? 'text-c6' : 'text-c6'}`}>
                        {insight.title}
                    </h3>
                    <p className="text-14 text-c5 leading-snug">{insight.desc}</p>
                </div>
            )) : (
                <div className="col-span-3 p-20 rounded-20 bg-c2 border border-c3 text-center text-c5">
                    Mots-clés bien équilibrés.
                </div>
            )}
        </div>


      {/* SECTION 2: TOP & DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-30">
          {/* Top 20 Bar Chart */}
          <div className="lg:col-span-2 bg-c1 border-2 border-c3 rounded-30 flex flex-col gap-20 h-[450px] p-20">
            <h2 className="text-24 font-semibold text-c6">Top 20 : Les incontournables</h2>
            <div className="w-full h-full pb-20">
                <BarChart
                    dataset={topKeywords}
                    xAxis={[{ scaleType: 'band', dataKey: 'title', tickLabelStyle: { fill: '#fff', fontSize: 10 } }]} 
                    series={[{ dataKey: 'count', label: 'Occurrences', color: '#9353d3' }]}
                    yAxis={[{ labelStyle: { fill: '#fff' } }]}
                />
            </div>
          </div>

          {/* Pie Chart Distribution */}
          <div className="bg-c1 border-2 border-c3 rounded-30 p-20 flex flex-col gap-20 h-[450px]">
             <h2 className="text-24 font-semibold text-c6">État du dictionnaire</h2>
             <div className="flex-1 w-full min-h-0">
                <PieChart
                    series={[
                        {
                            data: distributionData,
                            highlightScope: { fade: 'global', highlight: 'item' },
                            innerRadius: '60%',
                            paddingAngle: 5,
                            cornerRadius: 5,
                        },
                    ]}
                    slotProps={{
                        legend: {
                           position: { vertical: 'bottom', horizontal: 'center' }, 
                        }
                    }}
                    margin={{ top: 0, bottom: 80, left: 0, right: 0 }}
                    colors={['fill-c5', 'fill-c5']}
                />
             </div>
             <div className="text-center text-12 text-c5">
                Sur <strong>{metrics.length}</strong> mots-clés
             </div>
          </div>
      </div>

      {/* SECTION 3: SCATTER & ORPHANS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-30">
        {/* Scatter Plot */}
        <div className="bg-c1 border-2 border-c3 rounded-30 p-20 flex flex-col gap-20">
             <div className="flex justify-between items-start">
                  <h2 className="text-24 font-semibold text-c6">Typologie (Frequence vs Diversité)</h2>
             </div>
             <div className="w-full h-[500px]">
                <ScatterChart
                    series={[
                        {
                            label: 'Mots-clés',
                            data: scatterData.map(d => ({ x: d.x, y: d.y, id: d.id })),
                            valueFormatter: (_v, { dataIndex }) => scatterData[dataIndex]?.title || 'Keyword',
                        },
                    ]}
                    xAxis={[{ label: 'Score de Diversité (nb types)', min: 0, max: 8 }]}
                    yAxis={[{ label: 'Fréquence' }]}
                    grid={{ vertical: true, horizontal: true }}
                />
             </div>
        </div>

        {/* Orphans List */}
        <div className="bg-c1 border-2 border-c3 rounded-30 p-20 flex flex-col gap-20 max-h-[600px] overflow-hidden">
            <div className="flex justify-between items-center">
                <h2 className="text-24 font-semibold text-c6">À supprimer ? ({distributionData[0].value})</h2>
            </div>
            <p className="text-14 text-c5">Ces mots-clés n'ont jamais été utilisés dans le corpus analysé.</p>
            <div className="flex flex-wrap gap-10 overflow-y-auto content-start flex-1 pr-10">
                {metrics.filter(m => m.count === 0).slice(0, 100).map(m => (
                    <span key={m.id} className="px-10 py-5 bg-c3 rounded-8 text-c5 text-12 border border-c4">
                        {m.title}
                    </span>
                ))}
                {metrics.filter(m => m.count === 0).length > 100 && (
                    <span className="text-c5 text-12 self-center italic">
                        + {metrics.filter(m => m.count === 0).length - 100} ...
                    </span>
                )}
            </div>
        </div>
      </div>

      {/* SECTION 4: CO-OCCURRENCES & TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-30">
          {/* Top Co-occurrences */}
        <div className="col-span-1 bg-c1 border-2 border-c3 rounded-30 p-20 flex flex-col gap-20 h-[600px] overflow-hidden">
             <h2 className="text-24 font-semibold text-c6">Associations Fortes</h2>
             <p className="text-14 text-c5">Mots-clés les plus associés.</p>
             <div className="flex flex-col gap-10 overflow-y-auto pr-10">
                {coOccurrences.map((co, idx) => (
                    <div key={idx} className="flex justify-between items-center p-15 bg-c2 rounded-12 border border-c3/30">
                        <div className="flex flex-col gap-2">
                             <div className="flex gap-5 items-center">
                                <span className="text-c6 font-bold text-14">{co.pair[0]}</span>
                                <span className="text-c5 text-10">+</span>
                             </div>
                             <span className="text-c6 font-bold text-14">{co.pair[1]}</span>
                        </div>
                        <div className="px-10 py-5 bg-c3 rounded-full text-12 font-bold text-c6">
                            {co.count}
                        </div>
                    </div>
                ))}
             </div>
        </div>

        {/* Data Table */}
        <div className="col-span-2 bg-c1 border-2 border-c3 rounded-30 p-20 flex flex-col gap-20 h-[600px] overflow-hidden">
            <h2 className="text-24 font-semibold text-c6">Explorateur</h2>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <Table aria-label="Tableau des mots-clés" classNames={{ wrapper: "bg-c2", th: "bg-c3 text-c6", td: "text-c5" }} isHeaderSticky>
                    <TableHeader>
                        <TableColumn>MOT-CLÉ</TableColumn>
                        <TableColumn>TOTAL</TableColumn>
                        <TableColumn>DIVERSITÉ</TableColumn>
                        <TableColumn>DÉTAILS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {metrics.slice(0, 100).map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="font-medium text-14 text-c6">{row.title}</TableCell>
                                <TableCell>{row.count}</TableCell>
                                <TableCell>
                                    <div className="flex gap-5">
                                        {Array.from({length: row.diversityScore}).map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-purple-500"></div>
                                        ))}
                                        <span className="text-10 text-c5 ml-5">({row.diversityScore})</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-10">
                                    {Object.entries(row.types)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([type, count]) => `${type} (${count})`)
                                        .join(', ')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <p className="text-12 text-c5 text-center italic">Top 100 affiché.</p>
        </div>
      </div>
    </Layouts>
  );
};
