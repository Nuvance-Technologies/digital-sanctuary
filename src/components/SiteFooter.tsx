import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t, lang } = useI18n();
  return (
    <footer className="mt-24 px-4 pb-8">
      <div className="glass mx-auto max-w-6xl rounded-2xl px-6 py-8 text-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="font-serif text-lg">{lang === "hi" ? "श्री मीरा माई आश्रम" : "Shri Meera Mai Ashram"}</h3>
            <p className="mt-1 text-muted-foreground">
              {lang === "hi" ? "कपिलधारा, अमरकंटक, मध्य प्रदेश" : "Kapildhara, Amarkantak, Madhya Pradesh"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold">{t("nav_home")}</h4>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li><Link to="/history" className="hover:text-primary">{t("nav_history")}</Link></li>
              <li><Link to="/gallery" className="hover:text-primary">{t("nav_gallery")}</Link></li>
              <li><Link to="/calendar" className="hover:text-primary">{t("nav_calendar")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">{t("nav_donate")}</h4>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li><Link to="/donate" className="hover:text-primary">{t("nav_donate")}</Link></li>
              <li><Link to="/admin" className="hover:text-primary">{t("nav_admin")}</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
          ॐ नमो नारायणाय · © {new Date().getFullYear()} Shri Meera Mai Ashram
        </p>
      </div>
    </footer>
  );
}