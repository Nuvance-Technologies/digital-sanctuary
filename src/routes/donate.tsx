import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VirtualDiya } from "@/components/VirtualDiya";
import { Flame, Share2, Receipt, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/donate")({
  component: DonatePage,
  head: () => ({
    meta: [
      { title: "Daan — Shri Meera Mai Ashram" },
      { name: "description", content: "Offer your daan to Annakshetra, Maintenance, or Goshala. Light a virtual diya as your sankalp." },
    ],
  }),
});

const causes = [
  { key: "annakshetra", en: "Annakshetra", hi: "अन्नक्षेत्र", desc_en: "Daily food for thousands of devotees", desc_hi: "सहस्रों भक्तों हेतु प्रतिदिन भोजन" },
  { key: "maintenance", en: "Maintenance", hi: "रख-रखाव", desc_en: "Care for the Ashram premises", desc_hi: "आश्रम की देखभाल" },
  { key: "goshala", en: "Goshala", hi: "गौशाला", desc_en: "Seva of the sacred cows", desc_hi: "गौ माता की सेवा" },
] as const;

const presets = [101, 251, 501, 1100, 2100, 5100];

function DonatePage() {
  const { t, lang } = useI18n();
  const [cause, setCause] = useState<typeof causes[number]["key"]>("annakshetra");
  const [amount, setAmount] = useState<number>(501);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dedication, setDedication] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<{ ref: string; amount: number; dedication: string } | null>(null);

  const submit = async () => {
    if (!name.trim() || !email.trim() || amount < 1) {
      toast.error(lang === "hi" ? "नाम, ईमेल और राशि आवश्यक है" : "Name, email and amount required");
      return;
    }
    setBusy(true);
    // Simulation mode: insert as paid immediately. When Stripe is added, set status='pending', call Checkout, then poll.
    const { data, error } = await supabase
      .from("donations")
      .insert({
        cause,
        amount,
        donor_name: name.trim(),
        donor_email: email.trim(),
        dedication: dedication.trim() || null,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .select("reference_id, amount, dedication")
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Failed");
      return;
    }
    setSuccess({ ref: data.reference_id, amount: Number(data.amount), dedication: data.dedication ?? "" });
  };

  if (success) return <SuccessView data={success} />;

  return (
    <div className="px-4">
      <section className="mx-auto max-w-3xl pt-12 pb-8 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">{t("donate_title")}</h1>
        <p className="mt-3 text-muted-foreground">
          {lang === "hi" ? "आपके श्रद्धा-पुष्प से आश्रम की सेवा निरंतर चलती है।" : "Your offering keeps the seva alive."}
        </p>
      </section>
      <section className="mx-auto max-w-3xl pb-32">
        <Card className="glass border-0 p-6 md:p-8">
          <Tabs value={cause} onValueChange={(v) => setCause(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              {causes.map((c) => (
                <TabsTrigger key={c.key} value={c.key}>{lang === "hi" ? c.hi : c.en}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="mt-3 text-sm text-muted-foreground">
            {lang === "hi" ? causes.find((c) => c.key === cause)!.desc_hi : causes.find((c) => c.key === cause)!.desc_en}
          </p>

          <div className="mt-6">
            <Label>{t("donate_amount")}</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((p) => (
                <Button key={p} type="button" variant={amount === p ? "default" : "outline"} onClick={() => setAmount(p)} className={amount === p ? "bg-primary text-primary-foreground" : "glass"}>
                  ₹{p}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="mt-3"
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="dn">{t("donate_name")}</Label>
              <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="de">{t("donate_email")}</Label>
              <Input id="de" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor="dd">{t("donate_dedication")}</Label>
            <Textarea id="dd" value={dedication} onChange={(e) => setDedication(e.target.value)} rows={2} placeholder={lang === "hi" ? "जैसे: अपने पितरों को समर्पित" : "e.g. In memory of my parents"} />
          </div>

          {/* Diya preview */}
          <div className="mt-6 flex items-center justify-center">
            <VirtualDiya amount={amount} size={180} />
          </div>

          <Button onClick={submit} disabled={busy} size="lg" className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Flame className="mr-2 h-4 w-4" /> {t("donate_offer")}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {lang === "hi"
              ? "अभी सिमुलेशन मोड (UPI/Stripe परीक्षण)। वास्तविक भुगतान शीघ्र सक्रिय होगा।"
              : "Currently in simulation mode. Real Stripe payments activate when keys are added."}
          </p>
        </Card>
      </section>
    </div>
  );
}

function SuccessView({ data }: { data: { ref: string; amount: number; dedication: string } }) {
  const { t, lang } = useI18n();

  const share = async () => {
    const url = `${window.location.origin}/receipt/${data.ref}`;
    const text = `${lang === "hi" ? "मैंने श्री मीरा माई आश्रम को दान अर्पित किया।" : "I offered daan to Shri Meera Mai Ashram."} 🪔 ${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Daan — Shri Meera Mai Ashram", text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    }
  };

  return (
    <div className="px-4">
      <section className="mx-auto max-w-2xl pt-16 pb-32 text-center">
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <VirtualDiya amount={data.amount} size={280} />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 font-serif text-4xl md:text-5xl"
            >
              {t("diya_success")}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-3 text-muted-foreground">
              {lang === "hi" ? "आपकी श्रद्धा माँ नर्मदा तक पहुँच गई है।" : "Your offering has reached Maa Narmada."}
            </motion.p>
            {data.dedication && (
              <p className="mt-4 font-serif text-lg italic text-primary">"{data.dedication}"</p>
            )}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm">
              <Receipt className="h-4 w-4" /> {data.ref} · ₹{data.amount}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/receipt/$ref" params={{ ref: data.ref }}><Receipt className="mr-2 h-4 w-4" />{lang === "hi" ? "रसीद देखें" : "View Receipt"}</Link>
              </Button>
              <Button variant="outline" className="glass" onClick={share}><Share2 className="mr-2 h-4 w-4" />{lang === "hi" ? "साझा करें" : "Share"}</Button>
              <Button variant="outline" className="glass" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/receipt/${data.ref}`); toast.success("Link copied"); }}><Copy className="mr-2 h-4 w-4" />Link</Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
