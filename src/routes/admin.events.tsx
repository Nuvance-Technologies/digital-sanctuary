import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events")({ component: EventsAdmin });

function EventsAdmin() {
  const [events, setEvents] = useState<any[]>([]);
  const [f, setF] = useState({ title_en: "", title_hi: "", description_en: "", description_hi: "", event_date: "", type: "utsav", featured: false });
  const load = () => supabase.from("events").select("*").order("event_date").then(({ data }) => setEvents(data ?? []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!f.title_en || !f.event_date) return toast.error("Title and date required");
    const { error } = await supabase.from("events").insert(f as any);
    if (error) toast.error(error.message); else { toast.success("Added"); setF({ ...f, title_en: "", title_hi: "", description_en: "", description_hi: "" }); load(); }
  };
  const del = async (id: string) => { await supabase.from("events").delete().eq("id", id); load(); };

  return (
    <div className="space-y-6">
      <Card className="glass border-0 p-6">
        <h2 className="font-serif text-xl">Add event</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><Label>Title (EN)</Label><Input value={f.title_en} onChange={(e) => setF({ ...f, title_en: e.target.value })} /></div>
          <div><Label>Title (HI)</Label><Input value={f.title_hi} onChange={(e) => setF({ ...f, title_hi: e.target.value })} /></div>
          <div><Label>Date</Label><Input type="date" value={f.event_date} onChange={(e) => setF({ ...f, event_date: e.target.value })} /></div>
          <div><Label>Type</Label><Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["utsav","purnima","amavasya","ekadashi","other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div className="md:col-span-2"><Label>Description (EN)</Label><Textarea value={f.description_en} onChange={(e) => setF({ ...f, description_en: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Description (HI)</Label><Textarea value={f.description_hi} onChange={(e) => setF({ ...f, description_hi: e.target.value })} /></div>
          <div className="flex items-center gap-2"><Switch checked={f.featured} onCheckedChange={(v) => setF({ ...f, featured: v })} /><Label>Featured</Label></div>
        </div>
        <Button onClick={add} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-1 h-4 w-4" />Add</Button>
      </Card>
      <Card className="glass border-0 p-6">
        <h2 className="font-serif text-xl">Events ({events.length})</h2>
        <div className="mt-4 grid gap-2">
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border bg-background/40 p-3">
              <div className="flex-1">
                <div className="font-medium">{e.title_en} {e.featured && "★"}</div>
                <div className="text-xs text-muted-foreground">{e.event_date} · {e.type}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => del(e.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
