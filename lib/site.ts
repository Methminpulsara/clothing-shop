// EDIT ME: single source of truth for shop info. Values marked PLACEHOLDER are NOT confirmed real data.
export type Site = {
  name: string; tagline: string; address: string;
  hours: { day: string; open: string }[];
  whatsapp: string; instagram: string; facebook: string; email: string;
};

export const site: Site = {
  name: "NOIR THREADS",
  tagline: "Dress different.",
  address: "PLACEHOLDER: shop address, town",
  hours: [
    { day: "Monday", open: "PLACEHOLDER" }, { day: "Tuesday", open: "PLACEHOLDER" },
    { day: "Wednesday", open: "PLACEHOLDER" }, { day: "Thursday", open: "PLACEHOLDER" },
    { day: "Friday", open: "PLACEHOLDER" }, { day: "Saturday", open: "PLACEHOLDER" },
    { day: "Sunday", open: "PLACEHOLDER" },
  ],
  whatsapp: "", // digits only with country code, e.g. 94771234567 -> https://wa.me/<number>
  instagram: "", // full URL
  facebook: "",  // full URL
  email: "",
};
