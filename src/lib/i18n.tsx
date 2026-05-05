import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

type Dict = Record<string, { en: string; hi: string }>;

export const dict: Dict = {
  nav_home: { en: "Home", hi: "मुख्य" },
  nav_history: { en: "History", hi: "इतिहास" },
  nav_gallery: { en: "Gallery", hi: "गैलरी" },
  nav_parikrama: { en: "Parikrama", hi: "परिक्रमा" },
  nav_calendar: { en: "Calendar", hi: "पंचांग" },
  nav_donate: { en: "Donate", hi: "दान" },
  nav_admin: { en: "Admin", hi: "व्यवस्थापक" },
  hero_title: { en: "Shri Meera Mai Ashram", hi: "श्री मीरा माई आश्रम" },
  hero_sub: {
    en: "A digital sanctuary on the banks of Maa Narmada, Kapildhara, Amarkantak.",
    hi: "माँ नर्मदा के तट पर एक डिजिटल पावनधाम, कपिलधारा, अमरकंटक।",
  },
  hero_cta_donate: { en: "Offer Daan", hi: "दान अर्पण करें" },
  hero_cta_visit: { en: "Plan Your Parikrama", hi: "परिक्रमा की योजना" },
  history_title: { en: "Itihaas — The Living Legacy", hi: "इतिहास — जीवंत विरासत" },
  gallery_title: { en: "Media Vault", hi: "गैलरी" },
  gallery_utsavs: { en: "Utsavs", hi: "उत्सव" },
  gallery_darshan: { en: "Darshan", hi: "दर्शन" },
  gallery_meera: { en: "Life of Meera Mai", hi: "मीरा माई का जीवन" },
  parikrama_title: { en: "Parikrama Logistics", hi: "परिक्रमा सेवा" },
  parikrama_stay: { en: "Stay (Aavaas)", hi: "आवास" },
  parikrama_food: { en: "Bhojan", hi: "भोजन" },
  parikrama_kit: { en: "Essential Kit", hi: "आवश्यक सामग्री" },
  calendar_title: { en: "Dharmic Calendar", hi: "पंचांग" },
  donate_title: { en: "Trust-Centric Daan", hi: "श्रद्धा सहित दान" },
  donate_amount: { en: "Amount (₹)", hi: "राशि (₹)" },
  donate_name: { en: "Your Name", hi: "आपका नाम" },
  donate_email: { en: "Email", hi: "ईमेल" },
  donate_dedication: { en: "Sankalp / Dedication (optional)", hi: "संकल्प (वैकल्पिक)" },
  donate_offer: { en: "Light the Diya", hi: "दीपक प्रज्वलित करें" },
  diya_success: { en: "Your Sankalp is accepted", hi: "आपका संकल्प स्वीकार है" },
  rsvp: { en: "RSVP", hi: "उपस्थिति दर्ज करें" },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof dict) => string;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "en" || saved === "hi") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (k: keyof typeof dict) => dict[k][lang];

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}

export function pickLang<T extends Record<string, any>>(obj: T, base: string, lang: Lang): string {
  const hi = obj[`${base}_hi`];
  const en = obj[`${base}_en`];
  if (lang === "hi" && hi) return hi as string;
  return (en as string) ?? "";
}