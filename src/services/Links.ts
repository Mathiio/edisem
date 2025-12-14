import * as Items from "@/services/Items"
import { Actant } from "@/types/ui";


export const getLinksFromType = async (item: any, type: string): Promise<string[]> => {

  if (!item) return [];

  let links: string[] = [];

  switch (type) {
    case 'conference':
      links = await getLinksFromConf(item);
      break
    case 'citation':
      links = await getLinksFromCitation(item);
      break
    case 'actant':
      links = await getLinksFromActant(item);
      break
    case 'keyword':
      links = await getLinksFromKeywords(item);
      break
    case 'bibliography':
      links = await getLinksFromBibliographies(item);
      break
    case 'mediagraphie':
      links = await getLinksFromMediagraphies(item);
      break
    case 'collection': {
      const result = await getLinksFromCollections([item]);
      links = result[0]?.links || [];
    }
      break
    case 'university':
      links = await getLinksFromUniv(item);
      break
    case 'laboratory':
      links = await getLinksFromLab(item);
      break
    case 'doctoralschool':
      links = await getLinksFromSchool(item);
      break
    default:
      links = [];
  }
  return links;
};



export async function getLinksFromConf(conf: { actant?: Actant[]; collection?: string;[key: string]: any }): Promise<string[]> {
  if (!conf) return [];

  const links: string[] = [];

  if (conf.actant && Array.isArray(conf.actant)) {
    conf.actant.forEach((actant: any) => {
      links.push(actant);
    });
  }

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



export async function getLinksFromCollections(collections: { id: string }[]): Promise<{ id: string; links: string[] }[]> {
  if (!Array.isArray(collections)) return [];

  const confs = await Items.getAllConfs();

  return collections.map(collection => {
    const links: string[] = [];

    confs
      .filter((conf: any) => conf.collection === collection.id)
      .forEach((conf: any) => {
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
      Array.isArray(actant.laboratories) &&
      actant.laboratories.some((lab: any) => lab && lab.id === laboratory.id)
    )
    .map((actant: any) => actant.id);
}



export async function getLinksFromCitation(identifiant: any): Promise<string[]> {

  const links: string[] = [];
  const confs = await Items.getAllConfs();
  const citations = await Items.getCitations();

  // Trouver la citation
  const citation = citations.find((c: any) => c.id === identifiant.id);

  if (citation && citation.actants && Array.isArray(citation.actants)) {
    citation.actants.forEach((actant: any) => {
      const actantId = actant?.id || actant;
      if (actantId) {
        links.push(String(actantId));
      }
    });
  }

  if (citation && Array.isArray(citation.motcles)) {
    citation.motcles.forEach((motcle: any) => {
      const motcleId = motcle?.id || motcle;
      if (motcleId) {
        links.push(String(motcleId));
      }
    });
  }

  confs.forEach((conf: any) => {
    let confContainsCitation = false;

    if (conf && Array.isArray(conf.citations)) {
      confContainsCitation = conf.citations.some((citationRef: any) => {
        const citationId = citationRef?.id || citationRef;
        return String(citationId) === String(identifiant.id);
      });
    }

    if (confContainsCitation) {
      if (conf.id) {
        links.push(String(conf.id));
      }

      if (conf.actant && Array.isArray(conf.actant)) {
        conf.actant.forEach((actant: any) => {
          if (actant) {
            links.push(String(actant));
          }
        });
      }

      [
        'motcles',
        'bibliographies',
        'mediagraphies',
        'collection',
      ].forEach(attr => {
        const val = conf[attr];
        if (Array.isArray(val)) {
          val.forEach((x: any) => {
            const xId = x?.id || x;
            if (xId) {
              links.push(String(xId));
            }
          });
        } else if (val) {
          const valId = val?.id || val;
          if (valId) {
            links.push(String(valId));
          }
        }
      });
    }
  });

  const uniqueLinks = Array.from(new Set(links)).filter(id => id !== identifiant.id);

  return uniqueLinks;
}



export async function getLinksFromActant(actant: any) {
  if (!actant || !actant.id) return [];

  const links = new Set();

  // Liens directs depuis l'actant
  if (Array.isArray(actant.laboratories)) actant.laboratories.forEach((id: any) => id && links.add(id));
  if (Array.isArray(actant.universities)) actant.universities.forEach((id: any) => id && links.add(id));
  if (Array.isArray(actant.doctoralSchools)) actant.doctoralSchools.forEach((id: any) => id && links.add(id));

  // Conférences
  const confs = await Items.getAllConfs();

  confs.forEach((conf: any) => {
    if (conf.actant && Array.isArray(conf.actant) && conf.actant.some((a: any) => {
      const matches = a === actant.id;
      return matches;
    })) {


      if (conf.id) {
        links.add(String(conf.id));
      }
      [
        'citations',
        'motcles',
        'bibliographies',
        'mediagraphies',
        'collection',
        'recommendation'
      ].forEach(attr => {
        const val = conf[attr];
        if (Array.isArray(val)) {
          val.forEach(x => {
            // Si item est objets { id }, sinon direct string
            if (x && typeof x === 'object' && x.id) links.add(x.id);
            else if (typeof x === 'string') links.add(x);
          });
        } else if (val) {
          if (typeof val === 'object' && val.id) links.add(val.id);
          else if (typeof val === 'string') links.add(val);
        }
      });
    }
  });

  return Array.from(links) as string[];
}



export async function getLinksFromBibliographies(bibliography: any): Promise<string[]> {
  if (!bibliography || !bibliography.id) return [];
  const links: string[] = [];
  const confs = await Items.getAllConfs();
  confs.forEach((conf: any) => {
    if (conf && Array.isArray(conf.bibliographies) && conf.bibliographies.includes(bibliography.id)) {
      links.push(conf.id);
      if (Array.isArray(conf.motcles)) {
        links.push(...conf.motcles
          .filter((motcle: any) => motcle && motcle.id)
          .map((motcle: any) => motcle.id)
        );
      }
      if (conf.actant && Array.isArray(conf.actant)) {
        conf.actant.forEach((actant: any) => {
          if (actant && actant.id) {
            links.push(actant.id);
          }
        });
      }
    }
  });

  return links;
}



export async function getLinksFromMediagraphies(mediagraphie: any,): Promise<string[]> {
  if (!mediagraphie || !mediagraphie.id) return [];

  const links: string[] = [];
  const confs = await Items.getAllConfs();
  confs.forEach((conf: any) => {
    if (conf && Array.isArray(conf.mediagraphies) && conf.mediagraphies.includes(mediagraphie.id)) {
      links.push(conf.id);
      if (Array.isArray(conf.motcles)) {
        links.push(...conf.motcles
          .filter((motcle: any) => motcle && motcle.id)
          .map((motcle: any) => motcle.id)
        );
      }
      if (conf.actant && Array.isArray(conf.actant)) {
        conf.actant.forEach((actant: any) => {
          if (actant && actant.id) {
            links.push(actant.id);
          }
        });
      }
    }
  });

  return links;
}



export async function getLinksFromKeywords(keyword: any): Promise<string[]> {
  if (!keyword || !keyword.id) return [];

  const links: string[] = [];
  const confs = await Items.getAllConfs();
  confs.forEach((conf: any) => {
    if (conf &&
      Array.isArray(conf.motcles) &&
      conf.motcles.some((motcle: any) => motcle && motcle.id === keyword.id)) {
      links.push(conf.id);
      if (conf.actant && Array.isArray(conf.actant)) {
        conf.actant.forEach((actant: any) => {
          if (actant && actant.id) {
            links.push(actant.id);
          }
        });
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

  const citations = await Items.getCitations();
  citations.forEach((citation: any) => {
    if (citation &&
      Array.isArray(citation.motcles) &&
      citation.motcles.includes(keyword.id)) {
      links.push(citation.id);
      // Ajouter les actants de la citation
      if (citation.actants && Array.isArray(citation.actants)) {
        citation.actants.forEach((actant: any) => {
          if (actant && actant.id) {
            links.push(actant.id);
          }
        });
      }
    }
  });

  return links;
}