import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import * as Items from '@/services/Items';
import { Layouts } from '@/components/layout/Layouts';
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';
import { Link, Skeleton } from '@heroui/react';
import { FullCarrousel } from '@/components/ui/Carrousels';
import { ResourceCard } from '@/components/features/corpus/ResourceCard';
import { ThumbnailIcon } from '@/components/ui/icons';
import MediaViewer from '@/components/features/conference/MediaViewer';

// Interfaces based on backend response
interface ToolDetails {
  id: number | string;
  title: string;
  description?: string;
  purpose?: string;
  category?: string;
  release?: string;
  fileRelease?: string[]; // Array of strings
  license?: string;
  homepage?: string;
  repository?: string;
  bugDatabase?: string;
  os?: string[]; // Array of strings
  programmingLanguages?: any[];
  isPartOf?: any[];
  contributors?: any[];
  associatedMedia?: any[];
  usedBy?: any[]; // Resources using this tool
  usageCount?: number;
  logo?: string;
}

const SimpleToolCard = ({ tool }: { tool: any }) => {
    // Get image from associatedMedia or use default
    // Check if associatedMedia is array and has items
    const media = tool.associatedMedia && tool.associatedMedia.length > 0 ? tool.associatedMedia[0] : null;
    const imageSrc = tool.logo || tool.thumbnail || (media ? (media.thumbnail || media.url) : null);
    
    return (
      <Link href={`/corpus/tool/${tool.id}`} className="group shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer py-40 px-20 rounded-18 justify-between flex flex-col gap-4 hover:bg-c2 h-full transition-all ease-in-out duration-300 relative">
            {imageSrc ? (
               <div className="w-60 h-60 rounded-10 overflow-hidden bg-c3 flex-shrink-0">
                  <img
                    alt={tool.title}
                    className="w-full h-full object-cover"
                    src={imageSrc}
                  />
               </div>
            ) : (
                <div className="w-60 h-60 rounded-8 flex items-center justify-center bg-c3 flex-shrink-0">
                    <ThumbnailIcon className="text-c4/20" size={40} />
                </div>
            )}
            <p className="text-c6 text-16">{tool.title}</p>
      </Link>
    );
};


export const Tool: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Use any to avoid strict type checking issues with backend data
  const [tool, setTool] = useState<ToolDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedTools, setRelatedTools] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  
  // Fetch tool details
  const fetchToolData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await Items.getResourceDetails(id);
      setTool(data as unknown as ToolDetails);
    } catch(e) {
        console.error("Error fetching tool details", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch other tools for the carousel
  const fetchRelatedTools = useCallback(async () => {
      setLoadingRelated(true);
      try {
          const allTools = await Items.getTools(); // Retrieve all tools
          // Filter out current tool and maybe randomize
          const filtered = allTools
              .filter((t: any) => String(t.id) !== id) // Exclude current
              .sort(() => 0.5 - Math.random()) // Shuffle
              .slice(0, 10); // Take 10
          setRelatedTools(filtered);
      } catch (e) {
          console.error("Error fetching related tools", e);
      } finally {
          setLoadingRelated(false);
      }
  }, [id]);

  useEffect(() => {
    fetchToolData();
    fetchRelatedTools();
  }, [id, fetchToolData, fetchRelatedTools]);

  // Main Image
  const mainImage = useMemo(() => {
      if (tool?.logo) return tool.logo;
      if (tool?.associatedMedia && tool.associatedMedia.length > 0) {
          return tool.associatedMedia[0].thumbnail || tool.associatedMedia[0].url;
      }
      return null;
  }, [tool]);

  if (!loading && !tool) return <div>Outil non trouvé</div>;

  return (
    <Layouts className='col-span-12 flex flex-col gap-100'>
      <DynamicBreadcrumbs itemTitle={tool?.title || ''} />

      <div className='flex flex-col items-center gap-50'>      
        <div className='gap-20 text-c6 w-full flex flex-col items-center'>
            {loading ? 
                <div className='gap-20 w-full flex flex-col items-center'>
                    <Skeleton className="rounded-18 w-100 h-100 bg-c2" />
                    <Skeleton className="w-[400px] h-60 rounded-10 bg-c3" />
                </div>
            : 
            <>
            {mainImage ? (
               <img className='w-100 h-100 object-cover rounded-18' src={mainImage} alt={tool?.title} />
            ) : (
               <div className='w-100 h-100 rounded-18 object-cover flex items-center justify-center bg-c3'>
                  <div className="text-c6 text-4xl font-bold opacity-30">{tool?.title?.charAt(0)}</div>
               </div>
            )}
            <h1 className='text-64 font-medium text-c6 leading-none'>{tool?.title}</h1>
            </>
            }
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-25 w-2/3'>
            <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-25 rounded-20 flex flex-col gap-1.5 h-full'>
                <div className='flex items-center gap-10 border-b-2 border-c3 pb-2'>
                    <h3 className='text-16 font-medium text-c6 w-full text-center'>Date De Publication</h3>
                </div>
                
                <div className='flex flex-col gap-10'>
                    {loading ? (
                    <div className="flex flex-col gap-10">
                        <Skeleton className="h-6 w-full rounded-8" />
                    </div>
                    ) : (
                        <p className='text-14 text-c5 py-3 w-full text-center'>{tool?.release}</p>
                    )}
                </div>
            </div>

            <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-25 rounded-20 flex flex-col gap-1.5 h-full'>
                <div className='flex items-center gap-10 border-b-2 border-c3 pb-2'>
                    <h3 className='text-16 font-medium text-c6 w-full text-center'>Lien Externe</h3>
                </div>
                
                <div className='flex flex-col gap-10'>
                    {loading ? (
                    <div className="flex flex-col gap-10">
                        <Skeleton className="h-6 w-full rounded-8" />
                    </div>
                    ) : (
                        <a href={tool?.homepage} className='text-14 text-c5 py-3 px-4 hover:bg-c2 w-full text-center transition-all duration-300 ease-in-out rounded-8 cursor-pointer'>Page de l’outil</a>
                    )}
                </div>
            </div>

            <div className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 p-25 rounded-20 flex flex-col gap-1.5 h-full'>
                <div className='flex items-center gap-10 border-b-2 border-c3 pb-2'>
                    <h3 className='text-16 font-medium text-c6 w-full text-center'>Popularité</h3>
                </div>
                
                <div className='flex flex-col gap-10'>
                    {loading ? (
                    <div className="flex flex-col gap-10">
                        <Skeleton className="h-6 w-full rounded-8" />
                    </div>
                    ) : (
                        <p className='text-14 text-c5 py-3 w-full text-center'>Utilisé dans {tool?.usageCount} ressource{Number(tool?.usageCount) > 1 ? 's' : ''}</p>
                    )}
                </div>
            </div>
        </div>
      </div>

        {/* Thumbnails Gallery */}
        {tool?.associatedMedia && tool.associatedMedia.length > 0 && (
            <div className={`mx-auto mt-10 gap-6 ${tool.associatedMedia.length === 1 ? 'w-2/3' : 'w-full grid grid-cols-1 md:grid-cols-2'}`}>
                {tool.associatedMedia.map((media: any) => (
                    <div key={media.id} className="rounded-18 overflow-hidden relative shadow-lg">
                        <MediaViewer
                            src={media.thumbnail || media.url}
                            alt={media.title || tool.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        )}

          {/* Detailed Info List */}
          <div className="w-2/3 mx-auto flex flex-col mt-10 border-t border-c3">
               {/* Descriptif général */}
               {tool?.description && (
                   <div className="border-b-2 border-c3 py-6">
                       <h3 className="text-18 font-bold text-c6 mb-2">Descriptif général</h3>
                       <div className="text-c5 text-16 leading-relaxed whitespace-pre-wrap">
                           {tool.description}
                       </div>
                   </div>
               )}

               {/* Type de l'outil */}
               {tool?.category && (
                   <div className="border-b-2 border-c3 py-6">
                       <h3 className="text-18 font-bold text-c6 mb-2">Type de l'outil</h3>
                       <p className="text-c5 text-16">{tool.category}</p>
                   </div>
               )}

               {/* Fonction */}
               {tool?.purpose && (
                   <div className="border-b-2 border-c3 py-6">
                       <h3 className="text-18 font-bold text-c6 mb-2">Fonction</h3>
                       <p className="text-c5 text-16">{tool.purpose}</p>
                   </div>
               )}

               {/* Systèmes d'exploitation */}
               {tool?.os && tool.os.length > 0 && (
                   <div className="border-b-2 border-c3 py-6">
                       <h3 className="text-18 font-bold text-c6 mb-2">Systèmes d'exploitation</h3>
                       <p className="text-c5 text-16">{tool.os.join(', ')}</p>
                   </div>
               )}

               {/* License */}
               {tool?.license && (
                   <div className="border-b-2 border-c3 py-6">
                       <h3 className="text-18 font-bold text-c6 mb-2">License</h3>
                       <p className="text-c5 text-16">{tool.license}</p>
                   </div>
               )}

               {/* Format de fichier */}
               {tool?.fileRelease && tool.fileRelease.length > 0 && (
                   <div className="border-b-2 border-c3 py-6">
                       <h3 className="text-18 font-bold text-c6 mb-2">Format de fichier</h3>
                       <p className="text-c5 text-16">{tool.fileRelease.join(', ')}</p>
                   </div>
               )}

               {/* Langage de programmation de l'outil */}
               {tool?.programmingLanguages && tool.programmingLanguages.length > 0 && (
                   <div className="border-b-2 border-c3 py-6">
                       <h3 className="text-18 font-bold text-c6 mb-2">Langage de programmation de l'outil</h3>
                       <p className="text-c5 text-16">
                           {tool.programmingLanguages.map((lang: any) => lang.title).join(', ')}
                       </p>
                   </div>
               )}
          </div>

      {/* Carousel 1: Resources using this tool (usedBy) */}
      {tool?.usedBy && tool.usedBy.length > 0 && (
          <div className="w-full flex flex-col items-center gap-50 mt-20">
              <div className="w-full">
                  <FullCarrousel
                    title="Ressources utilisant cet outil"
                    data={tool.usedBy}
                    perPage={4}
                    perMove={1}
                    renderSlide={(resource: any) => (
                          <ResourceCard 
                             item={resource} 
                             className="h-full"
                             key={resource.id}
                          />
                    )}
                  />
              </div>
          </div>
      )}
      
      {/* Carousel 2: Related Tools (Simple Cards) */}
        <div className="w-full">
            {loadingRelated ? (
                <div className="w-full h-[200px] flex items-center justify-center">
                    <Skeleton className="w-full h-full bg-c3 rounded-xl"/>
                </div>
            ) : (
                <FullCarrousel
                    title="D'autres Outils à Découvrir"
                    data={relatedTools}
                    perPage={6}
                    perMove={1}
                    renderSlide={(t: any) => (
                        <SimpleToolCard tool={t} key={t.id}/>
                    )}
                />
            )}
        </div>

    </Layouts>
  );
};