import { Conference } from "@/types/ui";
import * as Items from "@/services/Items"

export interface SearchFilters {
  actants: any[];
  conferences: FilteredConfs;
  // recitsArtistiques: any[];
}

export interface FilteredConfs {
  seminars: Conference[];
  colloques: Conference[];
  studyDays: Conference[];
}

const SEARCH_TYPE_MAPPING = {
  'journées d\'études': 'journee_etudes',
  'journée d\'étude': 'journee_etudes',
  'journées': 'journee_etudes',
  'séminaire': 'seminaire',
  'seminaire': 'seminaire',
  'séminaires': 'seminaire',
  'colloque': 'colloque',
  'colloques': 'colloque',
} as const;

export class SearchService {

  static normalizeSearchQuery(query: string): string {
    return query.toLowerCase().trim();
  }

  static getConferenceTypeFromQuery(query: string): string[] {
    const normalizedQuery = this.normalizeSearchQuery(query);
    const matchedTypes: string[] = [];

    Object.entries(SEARCH_TYPE_MAPPING).forEach(([keyword, type]) => {
      if (normalizedQuery.includes(keyword)) {
        matchedTypes.push(type);
      }
    });

    return matchedTypes.length ? matchedTypes : ['seminaire', 'colloque', 'journee_etudes'];
  }

  static async searchActants(query: string): Promise<any[]> {
    try {
      const [actants, keywords] = await Promise.all([
        Items.getActants(),
        Items.getKeywords(),
      ]);

      const normalizedQuery = this.normalizeSearchQuery(query);

      return actants.filter((actant: any) => {
        const basicMatch = this.matchBasicActantFields(actant, normalizedQuery);
        const keywordMatch = this.matchActantKeywords(actant, keywords, normalizedQuery);

        return basicMatch || keywordMatch;
      });
    } catch (error) {
      console.error('Erreur lors de la recherche d\'actants:', error);
      return [];
    }
  }

  private static matchBasicActantFields(actant: any, query: string): boolean {
    const searchableFields = [
      actant.firstname,
      actant.lastname,
      `${actant.firstname} ${actant.lastname}`,
      actant.description,
      actant.bio
    ].filter(Boolean);

    return searchableFields.some(field =>
      field.toLowerCase().includes(query)
    );
  }

  private static matchActantKeywords(actant: any, keywords: any[], query: string): boolean {
    if (!actant.keywords?.length) return false;

    const actantKeywords = keywords.filter(kw =>
      actant.keywords.includes(kw.id)
    );

    return actantKeywords.some(kw =>
      kw.name?.toLowerCase().includes(query)
    );
  }

  static async searchConferences(query: string): Promise<FilteredConfs> {
    try {
      const [allConfs, actants, keywords] = await Promise.all([
        Items.getAllConfs(),
        Items.getActants(),
        Items.getKeywords(),
      ]);

      const conferenceTypes = this.getConferenceTypeFromQuery(query);
      const normalizedQuery = this.normalizeSearchQuery(query);

      const results: FilteredConfs = {
        seminars: [],
        colloques: [],
        studyDays: [],
      };

      conferenceTypes.forEach(type => {
        const typeConfs = this.filterConferencesByType(
          allConfs, actants, keywords, normalizedQuery, type
        );

        switch (type) {
          case 'seminaire':
            results.seminars = typeConfs;
            break;
          case 'colloque':
            results.colloques = typeConfs;
            break;
          case 'journee_etudes':
            results.studyDays = typeConfs;
            break;
        }
      });

      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche de conférences:', error);
      return { seminars: [], colloques: [], studyDays: [] };
    }
  }

  private static filterConferencesByType(
    allConfs: any[],
    actants: any[],
    keywords: any[],
    query: string,
    type: string
  ): Conference[] {
    return allConfs
      .filter(conf => conf.type === type)
      .filter(conf => {
        const basicMatch = this.matchBasicConferenceFields(conf, query);
        const actantMatch = this.matchConferenceActants(conf, actants, query);
        const keywordMatch = this.matchConferenceKeywords(conf, keywords, query);

        return basicMatch || actantMatch || keywordMatch;
      })
      .map(conf => this.enrichConferenceWithActants(conf, actants));
  }

  private static matchBasicConferenceFields(conf: any, query: string): boolean {
    const searchableFields = [
      conf.title,
      conf.description,
      conf.abstract,
      conf.event
    ].filter(Boolean);

    return searchableFields.some(field =>
      field.toLowerCase().includes(query)
    );
  }

  private static matchConferenceActants(conf: any, actants: any[], query: string): boolean {
    const confActants = this.getConferenceActants(conf, actants);

    return confActants.some(actant =>
      actant.firstname?.toLowerCase().includes(query) ||
      actant.lastname?.toLowerCase().includes(query) ||
      `${actant.firstname} ${actant.lastname}`.toLowerCase().includes(query) ||
      actant.description?.toLowerCase().includes(query)
    );
  }

  private static matchConferenceKeywords(conf: any, keywords: any[], query: string): boolean {
    if (!conf.keywords) return false;

    const confKeywords = this.getConferenceKeywords(conf, keywords);
    return confKeywords.some(kw =>
      kw.name?.toLowerCase().includes(query)
    );
  }

  private static getConferenceActants(conf: any, actants: any[]): any[] {
    if (!conf.actant) return [];

    if (Array.isArray(conf.actant)) {
      if (conf.actant.length > 0 && typeof conf.actant[0] === 'object' && conf.actant[0].firstname) {
        return conf.actant;
      } else {
        return actants.filter(act =>
          conf.actant.includes(String(act.id)) || conf.actant.includes(Number(act.id))
        );
      }
    } else if (typeof conf.actant === 'string') {
      if (conf.actant.includes(',')) {
        const actantIds = conf.actant.split(',').map((id: string) => id.trim());
        return actants.filter(act => actantIds.includes(String(act.id)));
      } else {
        const actant = actants.find(act => String(act.id) === conf.actant);
        return actant ? [actant] : [];
      }
    } else if (typeof conf.actant === 'number') {
      const actant = actants.find(act => Number(act.id) === conf.actant);
      return actant ? [actant] : [];
    }

    return [];
  }

  private static getConferenceKeywords(conf: any, keywords: any[]): any[] {
    if (!conf.keywords) return [];

    if (Array.isArray(conf.keywords)) {
      return keywords.filter(kw => conf.keywords.includes(kw.id));
    } else if (typeof conf.keywords === 'string') {
      const keywordIds = conf.keywords.includes(',')
        ? conf.keywords.split(',').map((id: string) => id.trim())
        : [conf.keywords];
      return keywords.filter(kw => keywordIds.includes(String(kw.id)));
    }

    return [];
  }

  private static enrichConferenceWithActants(conf: any, actants: any[]): Conference {
    return {
      ...conf,
      actant: this.getConferenceActants(conf, actants)
    };
  }

  // static async searchOeuvres(query: string): Promise<any[]> {
  //   try {
  //     const [actants, keywords] = await Promise.all([
  //       Items.getRecitsArtistiques(),
  //       Items.getActants(),
  //       Items.getKeywords()
  //     ]);

  //     const normalizedQuery = this.normalizeSearchQuery(query);

  //     return recitsArtistiques.filter((recit_artistique: any) => {
  //       const basicMatch = this.matchBasicOeuvreFields(recit_artistique, normalizedQuery);
  //       const genreMatch = this.matchOeuvreGenre(recit_artistique, normalizedQuery);
  //       const actantMatch = this.matchOeuvreActants(recit_artistique, actants, normalizedQuery);
  //       const keywordMatch = this.matchOeuvreKeywords(recit_artistique, keywords, normalizedQuery);

  //       return basicMatch || genreMatch || actantMatch || keywordMatch;
  //     });
  //   } catch (error) {
  //     console.error('Erreur lors de la recherche d\'œuvres:', error);
  //     return [];
  //   }
  // }

  // private static matchBasicOeuvreFields(recit_artistique: any, query: string): boolean {
  //   const searchableFields = [
  //     recit_artistique.title,
  //     recit_artistique.description,
  //     recit_artistique.abstract
  //   ].filter(Boolean);

  //   return searchableFields.some(field =>
  //     field.toLowerCase().includes(query)
  //   );
  // }

  // private static matchOeuvreGenre(recit_artistique: any, query: string): boolean {
  //   if (!recit_artistique.genre) return false;

  //   return recit_artistique.genre.toLowerCase().includes(query);
  // }

  // private static matchOeuvreActants(recit_artistique: any, actants: any[], query: string): boolean {
  //   if (!recit_artistique.actants?.length) return false;

  //   const oeuvreActants = actants.filter(actant =>
  //     recit_artistique.actants.includes(String(actant.id)) ||
  //     recit_artistique.actants.includes(Number(actant.id))
  //   );

  //   return oeuvreActants.some(actant =>
  //     actant.firstname?.toLowerCase().includes(query) ||
  //     actant.lastname?.toLowerCase().includes(query) ||
  //     `${actant.firstname} ${actant.lastname}`.toLowerCase().includes(query)
  //   );
  // }

  // private static matchOeuvreKeywords(recit_artistique: any, keywords: any[], query: string): boolean {
  //   if (!recit_artistique.keywords?.length) return false;

  //   const oeuvreKeywords = keywords.filter(kw =>
  //     recit_artistique.keywords.includes(String(kw.id)) ||
  //     recit_artistique.keywords.includes(Number(kw.id))
  //   );

  //   return oeuvreKeywords.some(kw =>
  //     kw.name?.toLowerCase().includes(query) ||
  //     kw.title?.toLowerCase().includes(query)
  //   );
  // }

  static async searchAll(query: string): Promise<SearchFilters> {
    const [actants, conferences] = await Promise.all([
      this.searchActants(query),
      this.searchConferences(query),
      // this.searchOeuvres(query)
    ]);

    return {
      actants,
      conferences,
      // recitsArtistiques,
    };
  }
}