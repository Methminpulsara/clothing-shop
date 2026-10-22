import data from "./images.json";

export type Photo = {
  slug: string;
  title: string;
  caption: string;
  category: "tops" | "outerwear" | "dresses" | "sets" | "footwear";
  width: number;
  height: number;
  aspect: number;
  src: string;
  srcLarge: string;
  srcSmall: string;
};

export const photos = data as Photo[];

export function photo(slug: string): Photo {
  const p = photos.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown photo: ${slug}`);
  return p;
}

export const categoryLabels: Record<Photo["category"], string> = {
  tops: "Tops",
  outerwear: "Outerwear",
  dresses: "Dresses",
  sets: "Sets",
  footwear: "Footwear",
};
