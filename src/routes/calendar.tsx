import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n, pickLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalIcon, Sparkles, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Dharmic Calendar — Shri Meera Mai Ashram" },
      { name: "description", content: "Upcoming Utsavs, Purnimas, Amavasyas, and Ashram events. RSVP to attend." },
    ],
  }),
});

type Event = {
  id: string;
  title_en: string;
  title_hi: string | null;
  description_en: string | null;
  description_hi: string | null;
  event_date: string;
  type: string;
  featured: boolean;
};

const DEVICE_KEY = "ashram_device_id";
function getDeviceId() {
  if (typeof window === "undefined") return "";
  let d = localStorage.getItem(DEVICE_KEY);
  if (!d) {
    d = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, d);
  }
  return d;
}

function CalendarPage() {
  const { t, lang } = useI18n();
  const [events, setEvents] = useState<Event[]>([]);
  const [myRsvps, setMyRsvps] = useState<string[]>([]);

  const load = () => {
    supabase
      .from("events")
      .select("*")
      .eq("published", true)
      .gte("event_date", new Date().toISOString().slice(0, 10))
      .order("event_date", { ascending: true })
      .then(({ data }) => setEvents((data as Event[]) ?? []));
  };

  useEffect(() => {
    load();
    const d = getDeviceId();
    supabase.from("rsvps").select("event_id").eq("device_id", d).then(({ data }) => {
      setMyRsvps(((data as { event_id: string }[]) ?? []).map((r) => r.event_id));
    });
  }, []);

  return (
    <div className="px-4">
      <section className="mx-auto max-w-5xl pt-12 pb-8 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">{t("calendar_title")}</h1>
        {myRsvps.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Bell className="h-4 w-4" />
            {lang === "hi" ? `${myRsvps.length} आगामी कार्यक्रम के लिए पंजीकृत` : `You're registered for ${myRsvps.length} upcoming event${myRsvps.length > 1 ? "s" : ""}`}
          </div>
        )}
      </section>
      <section className="mx-auto max-w-4xl pb-32">
        {events.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
            {lang === "hi" ? "अभी कोई आगामी कार्यक्रम नहीं" : "No upcoming events yet."}
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <EventCard event={e} rsvped={myRsvps.includes(e.id)} onRsvp={() => { setMyRsvps((m) => [...m, e.id]); }} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event: e, rsvped, onRsvp }: { event: Event; rsvped: boolean; onRsvp: () => void }) {
  const { lang } = useI18n();
  const date = new Date(e.event_date);
  const title = pickLang(e, "title", lang);
  const desc = pickLang(e, "description", lang);

  return (
    <Card className="glass border-0 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
          <div className="text-xs font-semibold uppercase text-muted-foreground">{date.toLocaleString(lang === "hi" ? "hi" : "en", { month: "short" })}</div>
          <div className="font-serif text-2xl">{date.getDate()}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {e.featured && <Sparkles className="h-4 w-4 text-primary" />}
            <h3 className="font-serif text-xl">{title}</h3>
          </div>
          {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
          <div className="mt-1 text-xs uppercase tracking-wider text-secondary">{e.type}</div>
        </div>
        <RsvpDialog eventId={e.id} eventTitle={title} rsvped={rsvped} onDone={onRsvp} />
      </div>
    </Card>
  );
}

function RsvpDialog({ eventId, eventTitle, rsvped, onDone }: { eventId: string; eventTitle: string; rsvped: boolean; onDone: () => void }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error(lang === "hi" ? "नाम और ईमेल आवश्यक है" : "Name and email required");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("rsvps").insert({
      event_id: eventId,
      name: name.trim(),
      email: email.trim(),
      device_id: getDeviceId(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(lang === "hi" ? "धन्यवाद! आपकी उपस्थिति दर्ज हो गई।" : "Thank you! Your RSVP is recorded.");
    setOpen(false);
    onDone();
  };

  if (rsvped) {
    return <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">{lang === "hi" ? "पंजीकृत" : "RSVP'd"}</span>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="glass"><CalIcon className="mr-1 h-3 w-3" />{t("rsvp")}</Button>
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{eventTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="rn">{lang === "hi" ? "नाम" : "Name"}</Label>
            <Input id="rn" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="re">{lang === "hi" ? "ईमेल" : "Email"}</Label>
            <Input id="re" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {t("rsvp")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
