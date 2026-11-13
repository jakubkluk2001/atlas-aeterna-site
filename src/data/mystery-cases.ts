import elDorado from "../assets/mysteries/el-dorado.svg?url";
import flyingDutchman from "../assets/mysteries/flying-dutchman.svg?url";
import holyGrail from "../assets/mysteries/holy-grail.svg?url";
import nazisInAntarctica from "../assets/mysteries/nazis-in-antarctica.svg?url";
import roswellIncident from "../assets/mysteries/roswell-incident.svg?url";
import womanInWhite from "../assets/mysteries/woman-in-white.svg?url";

export type MysteryTheme = "forest" | "ocean" | "archive" | "ice" | "desert" | "twilight";

export interface MysteryCase {
  slug: string;
  title: string;
  theme: MysteryTheme;
  artwork: string;
  published: boolean;
}

export const mysteryCases = [
  {
    slug: "el-dorado",
    title: "El Dorado",
    theme: "forest",
    artwork: elDorado,
    published: true,
  },
  {
    slug: "flying-dutchman",
    title: "The Flying Dutchman",
    theme: "ocean",
    artwork: flyingDutchman,
    published: true,
  },
  {
    slug: "holy-grail",
    title: "The Holy Grail",
    theme: "archive",
    artwork: holyGrail,
    published: false,
  },
  {
    slug: "nazis-in-antarctica",
    title: "Nazis in Antarctica",
    theme: "ice",
    artwork: nazisInAntarctica,
    published: false,
  },
  {
    slug: "roswell-incident",
    title: "The Roswell Incident",
    theme: "desert",
    artwork: roswellIncident,
    published: false,
  },
  {
    slug: "woman-in-white",
    title: "The Woman in White",
    theme: "twilight",
    artwork: womanInWhite,
    published: false,
  },
] as const satisfies readonly MysteryCase[];

export type MysterySlug = (typeof mysteryCases)[number]["slug"];

// Change this slug to choose the case shown in the homepage's Mysteries lens.
const featuredMysterySlug = "el-dorado" satisfies MysterySlug;

export const featuredMystery: MysteryCase =
  mysteryCases.find(({ slug }) => slug === featuredMysterySlug) ?? mysteryCases[0];
