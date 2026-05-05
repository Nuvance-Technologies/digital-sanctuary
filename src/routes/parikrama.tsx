import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BedDouble, Utensils, ListChecks, Clock } from "lucide-react";

export const Route = createFileRoute("/parikrama")({
  component: ParikramaPage,
  head: () => ({
    meta: [
      { title: "Parikrama Logistics — Shri Meera Mai Ashram" },
      { name: "description", content: "Plan your Narmada Parikrama: Aavaas (stay), Bhojan (food), and the essential kit checklist." },
    ],
  }),
});

const rooms = [
  { en: "Dormitory", hi: "धर्मशाला", status: "Available", count: 24 },
  { en: "Family Room", hi: "परिवार कक्ष", status: "Limited", count: 4 },
  { en: "Sadhu Niwas", hi: "साधु निवास", status: "Available", count: 12 },
];

const bhandara = [
  { en: "Pratah Prasad", hi: "प्रातः प्रसाद", time: "7:00 AM" },
  { en: "Madhyahna Bhojan", hi: "मध्याह्न भोजन", time: "12:00 PM" },
  { en: "Sandhya Aarti", hi: "संध्या आरती", time: "6:30 PM" },
  { en: "Ratri Bhog", hi: "रात्रि भोग", time: "8:00 PM" },
];

const kit = [
  { en: "Cotton clothing", hi: "सूती वस्त्र" },
  { en: "Walking footwear", hi: "चलने योग्य पादत्राण" },
  { en: "Water bottle", hi: "जल पात्र" },
  { en: "Personal medication", hi: "व्यक्तिगत औषधि" },
  { en: "Mat / blanket", hi: "चटाई / कम्बल" },
  { en: "Torch", hi: "टॉर्च" },
  { en: "Identity proof", hi: "पहचान पत्र" },
  { en: "Bhajan book", hi: "भजन पुस्तिका" },
];

function ParikramaPage() {
  const { t, lang } = useI18n();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const s = localStorage.getItem("parikrama_kit");
    if (s) setChecked(JSON.parse(s));
  }, []);
  useEffect(() => {
    localStorage.setItem("parikrama_kit", JSON.stringify(checked));
  }, [checked]);

  return (
    <div className="px-4">
      <section className="mx-auto max-w-5xl pt-12 pb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">{t("parikrama_title")}</h1>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 pb-32 lg:grid-cols-3">
        {/* Stay */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="glass border-0 p-6">
            <div className="flex items-center gap-2 text-secondary"><BedDouble /><h2 className="font-serif text-2xl">{t("parikrama_stay")}</h2></div>
            <ul className="mt-4 space-y-3">
              {rooms.map((r, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border bg-background/40 p-3">
                  <div>
                    <div className="font-medium">{lang === "hi" ? r.hi : r.en}</div>
                    <div className="text-xs text-muted-foreground">{r.count} {lang === "hi" ? "उपलब्ध" : "available"}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "Available" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>{r.status}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Food */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <Card className="glass border-0 p-6">
            <div className="flex items-center gap-2 text-primary"><Utensils /><h2 className="font-serif text-2xl">{t("parikrama_food")}</h2></div>
            <ul className="mt-4 space-y-3">
              {bhandara.map((b, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border bg-background/40 p-3">
                  <div className="font-medium">{lang === "hi" ? b.hi : b.en}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3 w-3" />{b.time}</div>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Kit */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <Card className="glass border-0 p-6">
            <div className="flex items-center gap-2 text-accent-foreground"><ListChecks /><h2 className="font-serif text-2xl">{t("parikrama_kit")}</h2></div>
            <ul className="mt-4 space-y-2">
              {kit.map((k, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-background/40">
                  <Checkbox id={`k${i}`} checked={!!checked[i]} onCheckedChange={(v) => setChecked((c) => ({ ...c, [i]: !!v }))} />
                  <label htmlFor={`k${i}`} className={`flex-1 cursor-pointer text-sm ${checked[i] ? "line-through text-muted-foreground" : ""}`}>
                    {lang === "hi" ? k.hi : k.en}
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
