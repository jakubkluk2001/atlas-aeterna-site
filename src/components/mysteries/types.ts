export interface CaseSectionDefinition {
  id: string;
  title: string;
}

export interface CaseSection extends CaseSectionDefinition {
  number: string;
}

export const createCaseSections = (
  sections: readonly CaseSectionDefinition[]
): readonly CaseSection[] => {
  if (sections.length === 0 || sections[0].id !== "overview") {
    throw new Error('Case sections must begin with the "overview" section.');
  }

  const ids = new Set<string>();

  return sections.map((section, index) => {
    if (ids.has(section.id)) {
      throw new Error(`Duplicate case section id: ${section.id}`);
    }

    ids.add(section.id);

    return {
      ...section,
      number: String(index).padStart(2, "0"),
    };
  });
};

export const getCaseSection = (
  sections: readonly CaseSection[],
  id: string
): CaseSection => {
  const section = sections.find((item) => item.id === id);

  if (!section) {
    throw new Error(`Unknown case section id: ${id}`);
  }

  return section;
};

export type EvidenceFit = "cover" | "contain";
export type EvidenceTone = "blue" | "gold" | "violet" | "neutral";
export type EvidenceStatusTone =
  | "strong"
  | "supporting"
  | "inconclusive"
  | "disputed"
  | "against"
  | "unsupported";

export interface EvidenceItem {
  id: string;
  number: string;
  type: string;
  title: string;
  description: string;
  status: EvidenceStatusTone;
  image: string | null;
  alt: string;
  fit: EvidenceFit;
  tone: EvidenceTone;
  meta: Array<{
    label: string;
    value: string;
  }>;
}

export type TheoryStatusTone = "leading" | "possibility" | "legend";
export type TheoryTone = "grounded" | "open" | "legendary";

export interface TheoryReference {
  label: string;
  title: string;
  href: string;
}

export interface TheoryItem {
  id: string;
  number: string;
  category: string;
  title: string;
  statement: string;
  summary: string;
  status: TheoryStatusTone;
  tone: TheoryTone;
  evidence: TheoryReference[];
  details: Array<{
    label: string;
    value: string;
  }>;
}

export type SearchStatusTone =
  | "partial"
  | "noDiscovery"
  | "abandoned"
  | "disputed"
  | "successful"
  | "ongoing";
export type SearchTone = "gold" | "blue" | "violet" | "neutral";
export type SearchNodePlacement = "above" | "below" | "left" | "right";

export interface SearchRecord {
  id: string;
  number: string;
  date: string;
  context: string;
  title: string;
  description: string;
  status: SearchStatusTone;
  tone: SearchTone;
  details: Array<{
    label: string;
    value: string;
  }>;
  changed: string;
}

export interface SearchRouteNode {
  number: string;
  label: string;
  date: string;
  href: string;
  x: string;
  y: string;
  tone: SearchTone;
  placement: SearchNodePlacement;
}

export interface SearchRouteRegion {
  label: string;
  position: "west" | "centre" | "east";
}

export interface SearchDashboardStat {
  label: string;
  value: string;
}

export type CulturalContextTone = "gold" | "blue" | "violet" | "neutral";

export interface CulturalContextTopic {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  tone: CulturalContextTone;
  details: Array<{
    label: string;
    value: string;
  }>;
}

export type AccountTone = "gold" | "blue" | "violet" | "neutral";
export type AccountEmphasis = "standard" | "defining";

export interface HistoricalAccount {
  id: string;
  number: string;
  date: string;
  author: string;
  work: string;
  sourceType: string;
  focus: string;
  claim: string;
  summary: string;
  significance: string;
  tone: AccountTone;
  emphasis: AccountEmphasis;
  details: Array<{
    label: string;
    value: string;
  }>;
}

export type FigureTone = "gold" | "blue" | "violet" | "neutral";

export interface FigureReference {
  label: string;
  href: string;
}

export interface KeyFigure {
  id: string;
  number: string;
  name: string;
  dates: string;
  role: string;
  tone: FigureTone;
  image: string | null;
  alt: string;
  initials: string;
  summary: string;
  profile: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  references: FigureReference[];
}
