import {SVGProps} from "react";

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