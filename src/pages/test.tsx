import { Layouts } from '@/components/layout/Layouts';
import { useState } from 'react';

interface EmbeddingSearchResult {
  success: boolean;
  message: string;
  query?: string;
  debug?: any;

  data?: {
    results?: Array<{
      resource_id: number;
      similarity: number;
      embedding_preview: number[];
      query_embedding_preview: number[];
    }>;
    stats: {
      total_embeddings_searched: number;
      results_returned: number;
      query_length: number;
      avg_similarity: number;
      max_similarity: number;
      min_similarity: number;
    };
  };
}

export const TestPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<EmbeddingSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTestUrl = (query: string, limit: number = 20): string => {
    const baseUrl = 'https://tests.arcanes.ca/omk/s/edisem/page/ajax';
    const params = new URLSearchParams({
      helper: 'Query',
      action: 'searchEmbeddings',
      json: '1',
      query: query,
      limit: limit.toString(),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const searchEmbeddings = async (query: string, limit: number = 20) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = getTestUrl(query.trim(), limit);
      console.log('Fetching URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      try {
        const result: EmbeddingSearchResult = JSON.parse(responseText);
        setSearchResult(result);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 200)}...`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      console.error("Erreur lors de la recherche d'embeddings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchEmbeddings(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchEmbeddings(searchQuery);
    }
  };

  // Fonction pour interpréter le score de similarité
  const interpretSimilarity = (score: number): { label: string; color: string; description: string } => {
    if (score >= 0.9)
      return {
        label: '🎯 Excellent',
        color: 'text-green-700 bg-green-100',
        description: 'Correspondance quasi-parfaite',
      };
    if (score >= 0.8)
      return {
        label: '✅ Très bon',
        color: 'text-green-600 bg-green-50',
        description: 'Très pertinent pour votre recherche',
      };
    if (score >= 0.7)
      return {
        label: '👍 Bon',
        color: 'text-blue-600 bg-blue-50',
        description: 'Pertinent et recommandé',
      };
    if (score >= 0.6)
      return {
        label: '🆗 Moyen',
        color: 'text-yellow-700 bg-yellow-50',
        description: 'Partiellement pertinent',
      };
    if (score >= 0.5)
      return {
        label: '⚠️ Faible',
        color: 'text-orange-600 bg-orange-50',
        description: 'Peu pertinent',
      };
    return {
      label: '❌ Très faible',
      color: 'text-red-600 bg-red-50',
      description: 'Non pertinent',
    };
  };

  // Analyse globale des résultats
  const analyzeResults = (query: string, results: EmbeddingSearchResult['data']['results']) => {
    if (!results || !results.length) return null;

    // Détecter la longueur de la requête pour adapter les seuils
    const queryLength = query.split(/\s+/).length;
    const isShortQuery = queryLength < 15; // Mots-clés vs phrase complète

    // Seuils adaptatifs (plus bas pour les requêtes courtes)
    const thresholds = isShortQuery ? { excellent: 0.65, good: 0.55, fair: 0.45, poor: 0.35 } : { excellent: 0.75, good: 0.65, fair: 0.55, poor: 0.45 };

    // Calculer le score moyen des 3 premiers résultats (plus représentatif)
    const avgTop3Score = results.slice(0, 3).reduce((sum: number, r: { similarity: number }) => sum + r.similarity, 0) / Math.min(3, results.length);

    const topScore = results[0]?.similarity || 0;

    let quality = '';
    let recommendation = '';
    let icon = '';

    // Évaluation adaptative
    if (topScore >= thresholds.excellent && avgTop3Score >= thresholds.good) {
      quality = 'Excellents';
      icon = '🎯';
      recommendation = isShortQuery
        ? 'Excellente correspondance ! Même avec une requête courte, les résultats sont très pertinents.'
        : 'Performances optimales. Les embeddings capturent parfaitement la sémantique.';
    } else if (topScore >= thresholds.good && avgTop3Score >= thresholds.fair) {
      quality = 'Bons';
      icon = '✅';
      recommendation = isShortQuery
        ? 'Bonne qualité. Les résultats sont pertinents malgré la brièveté de la recherche.'
        : 'Bonne qualité générale. Les concepts clés sont bien alignés.';
    } else if (topScore >= thresholds.fair) {
      quality = 'Moyens';
      icon = '⚠️';
      recommendation = isShortQuery
        ? "Score attendu pour une recherche par titre. Essayez d'ajouter des mots-clés."
        : 'Similarité modérée. Vérifiez que les embeddings contiennent bien le contenu complet.';
    } else {
      quality = 'Faibles';
      icon = '❌';
      recommendation =
        topScore < 0.3
          ? 'Aucune correspondance sémantique détectée. Vérifiez vos embeddings ou la requête.'
          : 'La pertinence est faible. Reformulez avec des termes plus proches du contenu indexé.';
    }

    // Catégoriser les résultats
    const excellent = results.filter((r: { similarity: number }) => r.similarity >= 0.9).length;
    const bon = results.filter((r: { similarity: number }) => r.similarity >= 0.7 && r.similarity < 0.9).length;
    const moyen = results.filter((r: { similarity: number }) => r.similarity >= 0.5 && r.similarity < 0.7).length;
    const faible = results.filter((r: { similarity: number }) => r.similarity < 0.5).length;

    return {
      quality,
      icon,
      recommendation,
      distribution: { excellent, bon, moyen, faible },
    };
  };

  const analysis = searchResult?.data ? analyzeResults(searchQuery, searchResult.data.results) : null;

  return (
    <Layouts className='col-span-10 flex flex-col gap-6 z-0 overflow-visible text-c6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-800'>🔍 Analyse de Recherche Sémantique</h1>
      </div>

      {/* URL de test direct */}
      {searchQuery && (
        <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm'>
          <strong>🔗 URL de test direct:</strong>
          <div className='mt-2'>
            <a href={getTestUrl(searchQuery, 20)} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline break-all'>
              {getTestUrl(searchQuery, 20)}
            </a>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <form onSubmit={handleSearchSubmit} className='flex gap-2'>
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder='Tapez votre requête de recherche...'
          className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
          disabled={isLoading}
        />
        <button
          type='submit'
          disabled={isLoading || !searchQuery.trim()}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md'>
          {isLoading ? '⏳ Recherche...' : '🚀 Rechercher'}
        </button>
      </form>

      {/* Messages d'erreur */}
      {error && (
        <div className='p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm'>
          <strong>❌ Erreur:</strong> {error}
        </div>
      )}

      {/* Debug info */}
      {searchResult && !searchResult.success && searchResult.debug && (
        <div className='p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg shadow-sm'>
          <strong>🐛 Informations de debug:</strong>
          <pre className='mt-2 text-xs overflow-x-auto'>{JSON.stringify(searchResult.debug, null, 2)}</pre>
        </div>
      )}

      {/* Résultats de recherche */}
      {searchResult && searchResult.success && searchResult.data && (
        <div className='space-y-6'>
          {/* Analyse Globale */}
          {analysis && (
            <div className='p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl shadow-md'>
              <div className='flex items-start gap-4'>
                <div className='text-5xl'>{analysis.icon}</div>
                <div className='flex-1'>
                  <h2 className='text-2xl font-bold text-gray-800 mb-2'>Résultats {analysis.quality}</h2>
                  <p className='text-gray-700 text-lg mb-4'>{analysis.recommendation}</p>

                  {/* Distribution des scores */}
                  <div className='grid grid-cols-4 gap-3 mt-4'>
                    <div className='bg-white p-3 rounded-lg shadow-sm text-center'>
                      <div className='text-2xl font-bold text-green-600'>{analysis.distribution.excellent}</div>
                      <div className='text-xs text-gray-600'>Excellents</div>
                      <div className='text-xs text-gray-500'>(≥ 0.9)</div>
                    </div>
                    <div className='bg-white p-3 rounded-lg shadow-sm text-center'>
                      <div className='text-2xl font-bold text-blue-600'>{analysis.distribution.bon}</div>
                      <div className='text-xs text-gray-600'>Bons</div>
                      <div className='text-xs text-gray-500'>(0.7-0.9)</div>
                    </div>
                    <div className='bg-white p-3 rounded-lg shadow-sm text-center'>
                      <div className='text-2xl font-bold text-yellow-600'>{analysis.distribution.moyen}</div>
                      <div className='text-xs text-gray-600'>Moyens</div>
                      <div className='text-xs text-gray-500'>(0.5-0.7)</div>
                    </div>
                    <div className='bg-white p-3 rounded-lg shadow-sm text-center'>
                      <div className='text-2xl font-bold text-red-600'>{analysis.distribution.faible}</div>
                      <div className='text-xs text-gray-600'>Faibles</div>
                      <div className='text-xs text-gray-500'>(&lt; 0.5)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistiques détaillées */}
          <div className='p-5 bg-white border border-gray-200 rounded-xl shadow-md'>
            <h2 className='text-xl font-bold mb-4 text-gray-800'>📊 Statistiques Détaillées</h2>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
              <div className='text-center p-3 bg-gray-50 rounded-lg'>
                <div className='text-sm text-gray-600 mb-1'>Base de données</div>
                <div className='text-2xl font-bold text-indigo-600'>{searchResult.data.stats.total_embeddings_searched}</div>
                <div className='text-xs text-gray-500'>embeddings</div>
              </div>
              <div className='text-center p-3 bg-gray-50 rounded-lg'>
                <div className='text-sm text-gray-600 mb-1'>Résultats</div>
                <div className='text-2xl font-bold text-indigo-600'>{searchResult.data.stats.results_returned}</div>
                <div className='text-xs text-gray-500'>retournés</div>
              </div>
              <div className='text-center p-3 bg-gray-50 rounded-lg'>
                <div className='text-sm text-gray-600 mb-1'>Requête</div>
                <div className='text-2xl font-bold text-indigo-600'>{searchResult.data.stats.query_length}</div>
                <div className='text-xs text-gray-500'>caractères</div>
              </div>
              <div className='text-center p-3 bg-green-50 rounded-lg border border-green-200'>
                <div className='text-sm text-gray-600 mb-1'>Score MAX</div>
                <div className='text-2xl font-bold text-green-600'>{searchResult.data.stats.max_similarity.toFixed(4)}</div>
                <div className='text-xs text-gray-500'>meilleur</div>
              </div>
              <div className='text-center p-3 bg-blue-50 rounded-lg border border-blue-200'>
                <div className='text-sm text-gray-600 mb-1'>Score MOYEN</div>
                <div className='text-2xl font-bold text-blue-600'>{searchResult.data.stats.avg_similarity.toFixed(4)}</div>
                <div className='text-xs text-gray-500'>moyenne</div>
              </div>
              <div className='text-center p-3 bg-orange-50 rounded-lg border border-orange-200'>
                <div className='text-sm text-gray-600 mb-1'>Score MIN</div>
                <div className='text-2xl font-bold text-orange-600'>{searchResult.data.stats.min_similarity.toFixed(4)}</div>
                <div className='text-xs text-gray-500'>plus faible</div>
              </div>
            </div>
          </div>

          {/* Liste des résultats avec interprétation */}
          <div className='p-5 bg-white border border-gray-200 rounded-xl shadow-md'>
            <h2 className='text-xl font-bold mb-4 text-gray-800'>🎯 Résultats Classés par Pertinence</h2>
            {searchResult.data.results.length > 0 ? (
              <div className='space-y-3 max-h-[600px] overflow-y-auto pr-2'>
                {searchResult.data.results.map((result, index) => {
                  const interpretation = interpretSimilarity(result.similarity);
                  return (
                    <div key={index} className='p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow'>
                      <div className='flex justify-between items-start mb-3'>
                        <div className='flex items-center gap-3'>
                          <div className='text-2xl font-bold text-gray-400'>#{index + 1}</div>
                          <div>
                            <div className='font-semibold text-gray-800'>Ressource ID: {result.resource_id}</div>
                            <div className='text-sm text-gray-500'>Embedding référence</div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-3xl font-bold text-blue-600 mb-1'>{result.similarity.toFixed(4)}</div>
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${interpretation.color}`}>{interpretation.label}</div>
                          <div className='text-xs text-gray-500 mt-1'>{interpretation.description}</div>
                        </div>
                      </div>

                      {/* Barre de progression visuelle */}
                      <div className='mb-3'>
                        <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                          <div
                            className='h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600'
                            style={{ width: `${result.similarity * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Aperçu des embeddings (optionnel, peut être caché) */}
                      <details className='text-xs text-gray-600'>
                        <summary className='cursor-pointer hover:text-gray-800 font-semibold mb-2'>🔍 Voir les vecteurs d'embedding</summary>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-2'>
                          <div className='bg-white p-2 rounded border'>
                            <strong>Ressource:</strong>
                            <div className='font-mono text-xs bg-gray-50 p-2 rounded mt-1'>[{result.embedding_preview.join(', ')}...]</div>
                          </div>
                          <div className='bg-white p-2 rounded border'>
                            <strong>Requête:</strong>
                            <div className='font-mono text-xs bg-gray-50 p-2 rounded mt-1'>[{result.query_embedding_preview.join(', ')}...]</div>
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <div className='text-4xl mb-2'>🔍</div>
                <p>Aucun résultat trouvé pour cette requête.</p>
              </div>
            )}
          </div>

          {/* Recommandations */}
          <div className='p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-md'>
            <h3 className='text-lg font-bold mb-3 text-gray-800'>💡 Recommandations</h3>
            <ul className='space-y-2 text-sm text-gray-700'>
              {searchResult.data.stats.max_similarity < 0.7 && (
                <li className='flex items-start gap-2'>
                  <span>⚠️</span>
                  <span>
                    <strong>Score maximum faible:</strong> Essayez de reformuler votre requête ou vérifiez la qualité de vos embeddings.
                  </span>
                </li>
              )}
              {searchResult.data.stats.avg_similarity < 0.6 && (
                <li className='flex items-start gap-2'>
                  <span>📉</span>
                  <span>
                    <strong>Moyenne faible:</strong> La pertinence globale est limitée. Considérez enrichir votre base d'embeddings.
                  </span>
                </li>
              )}
              {searchResult.data.stats.max_similarity >= 0.8 && (
                <li className='flex items-start gap-2'>
                  <span>✅</span>
                  <span>
                    <strong>Excellent!</strong> Vos embeddings capturent bien le sens de votre requête.
                  </span>
                </li>
              )}
              <li className='flex items-start gap-2'>
                <span>💭</span>
                <span>Les scores de similarité cosinus vont de -1 (opposé) à 1 (identique). Un score &gt; 0.7 indique une bonne correspondance sémantique.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layouts>
  );
};
