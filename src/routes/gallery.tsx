import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n, pickLang } from "@/lib/i18n";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ImageOff } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Gallery — Shri Meera Mai Ashram" },
      { name: "description", content: "Photos and videos from Utsavs, Darshan, and the Life of Shri Meera Mai." },
    ],
  }),
});

type Item = {
  id: string;
  category: "utsavs" | "darshan" | "meera_mai";
  type: "image" | "video";
  title_en: string;
  title_hi: string | null;
  media_url: string;
  thumbnail_url: string | null;
};

function GalleryPage() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("gallery_items")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as Item[]) ?? []);
        setLoading(false);
      });
  }, []);

  const cats = [
    { key: "utsavs", label: t("gallery_utsavs") },
    { key: "darshan", label: t("gallery_darshan") },
    { key: "meera_mai", label: t("gallery_meera") },
  ] as const;

  return (
    <div className="px-4">
      <section className="mx-auto max-w-5xl pt-12 pb-8 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">{t("gallery_title")}</h1>
      </section>
      <section className="mx-auto max-w-6xl pb-32">
        <Tabs defaultValue="utsavs">
          <TabsList className="glass mx-auto flex w-fit">
            {cats.map((c) => (
              <TabsTrigger key={c.key} value={c.key}>{c.label}</TabsTrigger>
            ))}
          </TabsList>
          {cats.map((c) => {
            const filtered = items.filter((i) => i.category === c.key);
            return (
              <TabsContent key={c.key} value={c.key} className="mt-8">
                {loading ? (
                  <div className="text-center text-muted-foreground">…</div>
                ) : filtered.length === 0 ? (
                  <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center text-muted-foreground">
                    <ImageOff className="mx-auto mb-3 h-8 w-8" />
                    {lang === "hi" ? "अभी कोई सामग्री उपलब्ध नहीं" : "No items yet — check back soon."}
                  </div>
                ) : (
                  <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                    {filtered.map((item, i) => {
                      const title = pickLang(item, "title", lang);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                          className="glass mb-4 break-inside-avoid overflow-hidden rounded-2xl transition-transform hover:-translate-y-1 hover:shadow-xl"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {item.type === "image" ? (
                            <img src={item.media_url} alt={title} loading="lazy" className="w-full" />
                          ) : (
                            <video src={item.media_url} poster={item.thumbnail_url ?? undefined} controls className="w-full" />
                          )}
                          {title && <div className="px-4 py-3 text-sm font-medium">{title}</div>}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>
    </div>
  );
}
