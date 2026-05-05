import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({ component: GalleryAdmin });

type Item = { id: string; category: string; type: string; title_en: string; title_hi: string | null; media_url: string; sort_order: number; published: boolean };

function GalleryAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ category: "utsavs", type: "image", title_en: "", title_hi: "", media_url: "", sort_order: 0 });

  const load = () => supabase.from("gallery_items").select("*").order("sort_order").then(({ data }) => setItems((data as Item[]) ?? []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.title_en || !form.media_url) return toast.error("Title and URL required");
    const { error } = await supabase.from("gallery_items").insert(form as any);
    if (error) toast.error(error.message); else { toast.success("Added"); setForm({ ...form, title_en: "", title_hi: "", media_url: "" }); load(); }
  };
  const del = async (id: string) => { await supabase.from("gallery_items").delete().eq("id", id); load(); };
  const togglePub = async (i: Item) => { await supabase.from("gallery_items").update({ published: !i.published }).eq("id", i.id); load(); };

  return (
    <div className="space-y-6">
      <Card className="glass border-0 p-6">
        <h2 className="font-serif text-xl">Add gallery item</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="utsavs">Utsavs</SelectItem><SelectItem value="darshan">Darshan</SelectItem><SelectItem value="meera_mai">Life of Meera Mai</SelectItem></SelectContent></Select></div>
          <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select></div>
          <div><Label>Title (EN)</Label><Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
          <div><Label>Title (HI)</Label><Input value={form.title_hi} onChange={(e) => setForm({ ...form, title_hi: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Media URL</Label><Input value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} placeholder="https://..." /></div>
          <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
        </div>
        <Button onClick={add} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-1 h-4 w-4" />Add</Button>
      </Card>
      <Card className="glass border-0 p-6">
        <h2 className="font-serif text-xl">Items ({items.length})</h2>
        <div className="mt-4 grid gap-3">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-lg border bg-background/40 p-3">
              {i.type === "image" ? <img src={i.media_url} className="h-12 w-12 rounded object-cover" /> : <div className="h-12 w-12 rounded bg-secondary/30" />}
              <div className="flex-1">
                <div className="font-medium">{i.title_en}</div>
                <div className="text-xs text-muted-foreground">{i.category} · order {i.sort_order}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => togglePub(i)}>{i.published ? "Published" : "Draft"}</Button>
              <Button size="sm" variant="outline" onClick={() => del(i.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
