import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
  width?: number;
  height?: number;
  transform?: string;
};

export type University = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  url: string;
  country: string;
};

export type Laboratory = {
  id: string;
  name: string;
  logo: string;
  url: string;
};

export type DoctoralSchool = {
  id: string;
  name: string;
  url: string;
};

export type Keyword = {
  id: string;
  class: string;
  title: string;
  definition: string;
  english_terms: string[];
  associated_term: Keyword[];
  orthographic_variants: string[];
  synonyms: string[];
  parent_concept: Keyword[];
  child_concept: Keyword[];
  related_concept: Keyword[];
  relative_concept: Keyword[];
  genre_media: string[];
  related_subject: string[];
  linked_subject: string[];
};

export type Actant = {
  id: string;
  interventions: number;
  firstname: string;
  lastname: string;
  picture: string;
  mail: string;
  url: string;
  jobTitle?: { title: string }[];
  universities: University[];
  doctoralSchools: DoctoralSchool[];
  laboratories: Laboratory[];
};

export type Citation = {
  id: string;
  actant: Actant;
  citation: string;
  startTime: number;
  endTime: number;
  keywords: Keyword[];
};

export type Edition = {
  id: string;
  title: string;
  conferences: Conference[];
  season: string;
  editionType: string;
  year: string;
};

export type Conference = {
  [x: string]: any;
  id: string;
  event: string;
  title: string;
  actant: Actant[];
  date: string;
  season: string;
  edition: string | number;
  url: string;
  collection: string;
  fullUrl: string;
  description: string;
  citations: Citation[];
  bibliographies: Bibliography[];
  mediagraphies: Mediagraphy[];
  motcles: Keyword[];
  recommendation: Conference[];
  thumbnail?: string;
  type: string;
};

export type Bibliography = {
  creator: { first_name: string; last_name: string }[];
  date: string;
  title: string;
  source?: string;
  type: string;
  class: number;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  publisher?: string;
  editor?: string;
  edition?: string;
  ispartof?: string;
  id: number;
  number: string;
  thumbnail?: string;
  resource_template_id: string;
}

export type Mediagraphy = {
  id: number;
  title: string;
  creator: { first_name: string; last_name: string }[];
  director: { first_name: string; last_name: string }[];
  date: string;
  publisher?: string;
  uri?: string;
  class: string;
  medium?: string;
  isPartOf?: string;
  format: string;
  type?: string;
  thumbnail?: string;
  location?: string;
  place?: string;
  resource_template_id: string;
}

// New types for unified resource details
export type ResourceMedia = {
  id: string;
  title: string;
  thumbnail: string | null;
};

export type ResourceReference = {
  id: string;
  title: string;
  thumbnail: string | null;
  date?: string | null;
  actants?: SimpleActant[];
};

export type ResourceCitation = {
  id: string;
  citation: string;
  actant: SimpleActant; // Always present (backend provides default empty object)
  startTime: number;
  endTime: number;
};

export type SimpleKeyword = {
  id: string;
  name: string;
};

export type SimpleActant = {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  picture: string | null;
  universities?: string[]; // Array of university shortNames
};

export type MicroResume = {
  id: string;
  title: string;
};

export type ResourceDetails = {
  id: string;
  title: string;
  type: 'seminaire' | 'journee_etudes' | 'colloque' | 'experimentation';
  template_id: number;

  // Common fields
  actants: SimpleActant[];
  associatedMedia: ResourceMedia[];
  date: string | null;
  videoUrl?: string | null;

  // Conference-specific fields
  abstract?: string;
  keywords?: SimpleKeyword[];
  relatedConferences?: ResourceReference[];
  citations?: ResourceCitation[];
  references?: ResourceReference[];
  microResumes?: MicroResume[];

  // Experimentation-specific fields
  description?: string;
};
