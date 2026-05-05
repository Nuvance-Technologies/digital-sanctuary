import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Flame, Calendar, ImageIcon, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Shri Meera Mai Ashram — Digital Sanctuary" },
      { name: "description", content: "A digital sanctuary on the banks of Maa Narmada, Kapildhara, Amarkantak. Darshan, Parikrama, Utsavs, and Daan." },
    ],
  }),
});

function Index() {
  const { t, lang } = useI18n();
  return (
    <div className="px-4">
      {/* Hero */}
      <section className="mx-auto max-w-5xl pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
        >
          <Flame className="h-3.5 w-3.5" /> {lang === "hi" ? "ॐ नमो नारायणाय" : "Om Namo Narayanaya"}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="mt-6 font-serif text-5xl font-semibold leading-tight md:text-7xl"
        >
          {t("hero_title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground"
        >
          {t("hero_sub")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/donate"><Flame className="mr-2 h-4 w-4" />{t("hero_cta_donate")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="glass">
            <Link to="/parikrama">{t("hero_cta_visit")}</Link>
          </Button>
        </motion.div>
      </section>

      {/* Quick tiles */}
      <section className="mx-auto grid max-w-6xl gap-4 pb-24 md:grid-cols-4">
        {[
          { to: "/history", icon: Flame, label: t("nav_history") },
          { to: "/gallery", icon: ImageIcon, label: t("nav_gallery") },
          { to: "/calendar", icon: Calendar, label: t("nav_calendar") },
          { to: "/parikrama", icon: MapPin, label: t("nav_parikrama") },
        ].map((tile, i) => (
          <motion.div
            key={tile.to}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link to={tile.to} className="glass block rounded-2xl p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <tile.icon className="h-8 w-8 text-primary" />
              <div className="mt-3 font-serif text-xl">{tile.label}</div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Invocation card */}
      <section className="mx-auto max-w-3xl pb-32">
        <div className="glass rounded-3xl p-10 text-center">
          <h2 className="font-serif text-3xl">{lang === "hi" ? "नर्मदे हर" : "Narmade Har"}</h2>
          <p className="mt-3 text-muted-foreground">
            {lang === "hi"
              ? "माँ नर्मदा की कृपा से, श्री मीरा माई के चरणों में नमन।"
              : "By the grace of Maa Narmada, we bow at the feet of Shri Meera Mai."}
          </p>
        </div>
      </section>
    </div>
  );
}
