import * as Items from "@/services/Items"


export const getLinksFromType = async (item: any, type: string): Promise<string[]> => {
    if (!item) return [];
  
    switch (type) {
      case 'conference':
        return await getLinksFromConf(item);
      case 'citation':
        return await getLinksFromCitation(item);
      case 'actant':
        return await getLinksFromActant(item);
      case 'keyword':
        return await getLinksFromKeywords(item);
      case 'bibliography':
        return await getLinksFromBibliographies(item);
      case 'mediagraphie':
        return await getLinksFromMediagraphies(item);
      case 'collection': {
        const result = await getLinksFromCollections([item]);
        return result[0]?.links || [];
      }
      case 'university':
        return await getLinksFromUniv(item);
      case 'laboratory':
        return await getLinksFromLab(item);
      case 'doctoralschool':
        return await getLinksFromSchool(item);
      default:
        return [];
    }
  };
  
  
  
  
  export async function getLinksFromConf(conf: { actant?: string; collection?: string; [key: string]: any }): Promise<string[]> {
    if (!conf) return [];
    
    const links: string[] = [];
    
    if (conf.actant) links.push(conf.actant);
    
    ['bibliographies', 'citations', 'mediagraphies', 'recommendation', 'motcles']
      .forEach(key => {
        if (Array.isArray(conf[key])) {
          links.push(...(key === 'motcles' 
            ? conf[key].map((motcle: { id: string }) => motcle.id) 
            : conf[key]
          ));
        }
      });
    
    if (conf.collection) {
      links.push(conf.collection);
    }
    
    return links;
  }
  
  
  
  
  export async function getLinksFromCollections( collections: { id: string }[]): Promise<{ id: string; links: string[] }[]> {
    if (!Array.isArray(collections)) return [];
  
    const confs = await Items.getConfs();
    
    return collections.map(collection => {
      const links: string[] = [];
      
      confs
        .filter((conf :any) => conf.collection === collection.id)
        .forEach((conf :any) => {
          links.push(conf.id);
        });
      
      return {
        id: collection.id,
        links
      };
    });
  }
  
  
  
  
  export async function getLinksFromUniv(university: any): Promise<string[]> {
    if (!university || !university.id) return [];
  
    const actants = await Items.getActants();
    
    return actants
      .filter((actant: any) => 
        actant && 
        Array.isArray(actant.universities) && 
        actant.universities.some((univ: any) => univ && univ.id === university.id)
      )
      .map((actant: any) => actant.id);
  }
  
  
  
  
  export async function getLinksFromSchool(school: any): Promise<string[]> {
    if (!school || !school.id) return [];
  
    const actants = await Items.getActants();
    
    return actants
      .filter((actant: any) => 
        actant && 
        Array.isArray(actant.doctoralSchools) && 
        actant.doctoralSchools.some((docSchool: any) => docSchool && docSchool.id === school.id)
      )
      .map((actant: any) => actant.id);
  }
  
  
  
  
  export async function getLinksFromLab(laboratory: any): Promise<string[]> {
    if (!laboratory || !laboratory.id) return [];
  
    const actants = await Items.getActants();
    
    return actants
      .filter((actant: any) => 
        actant && 
        Array.isArray(actant.laboritories) && 
        actant.laboritories.some((lab: any) => lab && lab.id === laboratory.id)
      )
      .map((actant: any) => actant.id);
  }
  
  
  
  
  export async function getLinksFromCitation(identifiant: any): Promise<string[]> {
    if (!identifiant || !identifiant.id) return [];
    
    const links: string[] = [];
    const confs = await Items.getConfs();
    const citations = await Items.getCitations();
    
    const citation = citations.find((c :any) => c.id === identifiant.id);
    
    if (citation && Array.isArray(citation.motcles)) {
      links.push(...citation.motcles.filter(Boolean));
    }
    
    confs.forEach((conf: any) => {
      if (conf && Array.isArray(conf.citations) && conf.citations.includes(identifiant.id)) {
        if (conf.actant) {
          links.push(conf.actant);
        }
      }
    });
    
    return links;
  }
  
  
  
  
  export async function getLinksFromActant(actant: any): Promise<string[]> {
    if (!actant || !actant.id) return [];
  
    const links: string[] = [];
  
    ['laboritories', 'universities', 'doctoralSchools'].forEach(key => {
      if (Array.isArray(actant[key])) {
        links.push(
          ...actant[key]
            .filter((item: any) => item && item.id)
            .map((item: any) => item.id)
        );
      }
    });
  
    const confs = await Items.getConfs();
    confs.forEach((conf: any) => {
      if (conf && conf.id && conf.actant === actant.id) {
        if (Array.isArray(conf.citations)) {
          links.push(...conf.citations.filter(Boolean));
        }
        if (Array.isArray(conf.motcles)) {
          links.push(
            ...conf.motcles
              .filter((motcle: any) => motcle && motcle.id)
              .map((motcle: any) => motcle.id)
          );
        }
      }
    });
    console.log(links);
    return links;
  }
  
  export async function getLinksFromBibliographies(bibliography: any): Promise<string[]> {
    if (!bibliography || !bibliography.id) return [];
    const links: string[] = [];
    const confs = await Items.getConfs();
    confs.forEach((conf: any) => {
      if (conf && Array.isArray(conf.bibliographies) && conf.bibliographies.includes(bibliography.id)) {
        links.push(conf.id);  
        if (Array.isArray(conf.motcles)) {
          links.push(...conf.motcles
            .filter((motcle: any) => motcle && motcle.id)
            .map((motcle: any) => motcle.id)
          );
        }
      }
    });
    
    return links;
  }
  
  export async function getLinksFromMediagraphies(mediagraphie: any, ): Promise<string[]> {
    if (!mediagraphie || !mediagraphie.id) return [];
    
    const links: string[] = [];
    const confs = await Items.getConfs();
    confs.forEach((conf : any) => {
      if (conf && Array.isArray(conf.mediagraphies) && conf.mediagraphies.includes(mediagraphie.id)) {
        links.push(conf.id);  
        if (Array.isArray(conf.motcles)) {
          links.push(...conf.motcles
            .filter((motcle: any) => motcle && motcle.id)
            .map((motcle: any) => motcle.id)
          );
        }
      }
    });
    
    return links;
  }
  
  export async function getLinksFromKeywords(keyword: any): Promise<string[]> {
    if (!keyword || !keyword.id) return [];
    
    const links: string[] = [];
    const confs = await Items.getConfs();
    confs.forEach((conf:any) => {
      if (conf && 
          Array.isArray(conf.motcles) && 
          conf.motcles.some((motcle: any) => motcle && motcle.id === keyword.id)) {
        links.push(conf.id);
        if (conf.actant) {
          links.push(conf.actant);
        }
        if (Array.isArray(conf.citations)) {
          links.push(...conf.citations.filter(Boolean));
        }
        if (Array.isArray(conf.bibliographies)) {
          links.push(...conf.bibliographies.filter(Boolean));
        }
        if (Array.isArray(conf.mediagraphies)) {
          links.push(...conf.mediagraphies.filter(Boolean));
        }
      }
    });
    
    return links;
  }