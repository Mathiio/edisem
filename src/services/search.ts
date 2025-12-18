import { Conference } from "@/types/ui";
import * as Items from "@/services/Items"

export interface SearchFilters {
  actants: any[];
  conferences: FilteredConfs;
  recitsArtistiques: any[];
}

export interface FilteredConfs {
  seminars: Conference[];
  colloques: Conference[];
  studyDays: Conference[];
}

const SEARCH_TYPE_MAPPING = {
  'journées d\'études': 'studyday',
  'journée d\'étude': 'studyday',
  'journées': 'studyday',
  'séminaire': 'seminar',
  'seminaire': 'seminar',
  'séminaires': 'seminar',
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

    return matchedTypes.length ? matchedTypes : ['seminar', 'colloque', 'studyday'];
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
      const [allConfs, actants, keywords, editions] = await Promise.all([
        Items.getAllConfs(),
        Items.getActants(),
        Items.getKeywords(),
        Items.getEditions()
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
          allConfs, actants, keywords, editions, normalizedQuery, type
        );

        switch (type) {
          case 'seminar':
            results.seminars = typeConfs;
            break;
          case 'colloque':
            results.colloques = typeConfs;
            break;
          case 'studyday':
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
    editions: any[],
    query: string,
    type: string
  ): Conference[] {
    return allConfs
      .filter(conf => conf.type === type)
      .filter(conf => {
        const basicMatch = this.matchBasicConferenceFields(conf, query);
        const actantMatch = this.matchConferenceActants(conf, actants, query);
        const keywordMatch = this.matchConferenceKeywords(conf, keywords, query);
        const editionMatch = this.matchConferenceEditions(conf, editions, query);

        return basicMatch || actantMatch || keywordMatch || editionMatch;
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

  private static matchConferenceEditions(conf: any, editions: any[], query: string): boolean {
    if (!conf.edition) return false;

    const edition = editions.find(ed => ed.id === conf.edition);
    return edition?.title?.toLowerCase().includes(query) ||
      edition?.season?.toLowerCase().includes(query) ||
      edition?.type?.toLowerCase().includes(query);
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

  static async searchOeuvres(query: string): Promise<any[]> {
    try {
      const [recitsArtistiques, actants, keywords] = await Promise.all([
        Items.getRecitsArtistiques(),
        Items.getActants(),
        Items.getKeywords()
      ]);

      const normalizedQuery = this.normalizeSearchQuery(query);

      return recitsArtistiques.filter((oeuvre: any) => {
        const basicMatch = this.matchBasicOeuvreFields(oeuvre, normalizedQuery);
        const genreMatch = this.matchOeuvreGenre(oeuvre, normalizedQuery);
        const actantMatch = this.matchOeuvreActants(oeuvre, actants, normalizedQuery);
        const keywordMatch = this.matchOeuvreKeywords(oeuvre, keywords, normalizedQuery);

        return basicMatch || genreMatch || actantMatch || keywordMatch;
      });
    } catch (error) {
      console.error('Erreur lors de la recherche d\'œuvres:', error);
      return [];
    }
  }

  private static matchBasicOeuvreFields(oeuvre: any, query: string): boolean {
    const searchableFields = [
      oeuvre.title,
      oeuvre.description,
      oeuvre.abstract
    ].filter(Boolean);

    return searchableFields.some(field =>
      field.toLowerCase().includes(query)
    );
  }

  private static matchOeuvreGenre(oeuvre: any, query: string): boolean {
    if (!oeuvre.genre) return false;

    return oeuvre.genre.toLowerCase().includes(query);
  }

  private static matchOeuvreActants(oeuvre: any, actants: any[], query: string): boolean {
    if (!oeuvre.actants?.length) return false;

    const oeuvreActants = actants.filter(actant =>
      oeuvre.actants.includes(String(actant.id)) ||
      oeuvre.actants.includes(Number(actant.id))
    );

    return oeuvreActants.some(actant =>
      actant.firstname?.toLowerCase().includes(query) ||
      actant.lastname?.toLowerCase().includes(query) ||
      `${actant.firstname} ${actant.lastname}`.toLowerCase().includes(query)
    );
  }

  private static matchOeuvreKeywords(oeuvre: any, keywords: any[], query: string): boolean {
    if (!oeuvre.keywords?.length) return false;

    const oeuvreKeywords = keywords.filter(kw =>
      oeuvre.keywords.includes(String(kw.id)) ||
      oeuvre.keywords.includes(Number(kw.id))
    );

    return oeuvreKeywords.some(kw =>
      kw.name?.toLowerCase().includes(query) ||
      kw.title?.toLowerCase().includes(query)
    );
  }

  static async searchAll(query: string): Promise<SearchFilters> {
    const [actants, conferences, recitsArtistiques] = await Promise.all([
      this.searchActants(query),
      this.searchConferences(query),
      this.searchOeuvres(query)
    ]);

    return {
      actants,
      conferences,
      recitsArtistiques,
    };
  }
}