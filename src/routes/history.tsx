import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "Itihaas — Shri Meera Mai Ashram" },
      { name: "description", content: "The living legacy of Shri Meera Mai — life, lineage, and the founding of the Ashram at Kapildhara." },
    ],
  }),
});

const timeline = [
  {
    year: "Early Life",
    en: { title: "A Child of the Narmada", body: "Born on the banks of the sacred river, Meera Mai's heart was given to bhakti from her earliest years." },
    hi: { title: "नर्मदा की संतान", body: "पवित्र नदी के तट पर जन्मी, मीरा माई का हृदय बचपन से ही भक्ति में रमा रहा।" },
  },
  {
    year: "Awakening",
    en: { title: "The Inner Call", body: "After years of seva and tapasya, she received darshan that would shape her life's mission." },
    hi: { title: "आंतरिक पुकार", body: "वर्षों की सेवा और तपस्या के पश्चात, उन्हें वह दर्शन प्राप्त हुआ जिसने उनके जीवन का उद्देश्य निर्धारित किया।" },
  },
  {
    year: "Founding",
    en: { title: "Ashram at Kapildhara", body: "The sanctuary at Kapildhara was established as a refuge for parikrama yatris and seekers." },
    hi: { title: "कपिलधारा आश्रम", body: "कपिलधारा का यह पावनधाम परिक्रमा यात्रियों एवं साधकों के आश्रय हेतु स्थापित किया गया।" },
  },
  {
    year: "Seva",
    en: { title: "Annakshetra & Goshala", body: "The Annakshetra serves thousands daily; the Goshala protects the sacred cows." },
    hi: { title: "अन्नक्षेत्र एवं गौशाला", body: "अन्नक्षेत्र में प्रतिदिन सहस्रों भक्तों को भोजन प्राप्त होता है; गौशाला में गौ माता की सेवा होती है।" },
  },
  {
    year: "Today",
    en: { title: "A Living Sanctuary", body: "Generations of devotees continue Meera Mai's vision of seva, sadhana, and surrender." },
    hi: { title: "जीवंत पावनधाम", body: "भक्तों की पीढ़ियाँ मीरा माई की सेवा, साधना एवं समर्पण की दृष्टि को आगे बढ़ा रही हैं।" },
  },
];

function HistoryPage() {
  const { t, lang } = useI18n();
  return (
    <div className="px-4">
      <section className="mx-auto max-w-3xl pt-12 pb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">{t("history_title")}</h1>
      </section>
      <section className="mx-auto max-w-3xl pb-32">
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2" />
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className={`relative mb-10 md:mb-16 md:w-1/2 ${i % 2 === 0 ? "md:pr-12" : "md:ml-auto md:pl-12"} pl-12 md:pl-0`}
            >
              <div className="absolute left-2 top-3 h-4 w-4 rounded-full border-2 border-background bg-primary md:left-auto md:right-[-9px]" style={i % 2 !== 0 ? { left: -9, right: "auto" } : {}} />
              <div className="glass rounded-2xl p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">{item.year}</div>
                <h3 className="mt-1 font-serif text-2xl">{item[lang].title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item[lang].body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
