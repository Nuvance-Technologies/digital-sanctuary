import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Languages, Flame } from "lucide-react";

export function SiteHeader() {
  const { lang, setLang, t } = useI18n();
  const { location } = useRouterState();

  const links = [
    { to: "/", label: t("nav_home") },
    { to: "/history", label: t("nav_history") },
    { to: "/gallery", label: t("nav_gallery") },
    { to: "/parikrama", label: t("nav_parikrama") },
    { to: "/calendar", label: t("nav_calendar") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold">
          <Flame className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">{lang === "hi" ? "श्री मीरा माई" : "Shri Meera Mai"}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-primary/10 ${
                location.pathname === l.to ? "text-primary font-semibold" : "text-foreground/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="gap-1"
          >
            <Languages className="h-4 w-4" />
            <span className="text-xs font-semibold">{lang === "en" ? "हिं" : "EN"}</span>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/donate">{t("nav_donate")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}