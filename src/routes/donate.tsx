import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { createDonationCheckout } from "@/server/stripe.functions";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VirtualDiya } from "@/components/VirtualDiya";
import { Flame } from "lucide-react";
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
  const checkout = useServerFn(createDonationCheckout);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("canceled")) {
      toast.info(lang === "hi" ? "भुगतान रद्द किया गया" : "Payment canceled");
    }
  }, [lang]);

  const submit = async () => {
    if (!name.trim() || !email.trim() || amount < 1) {
      toast.error(lang === "hi" ? "नाम, ईमेल और राशि आवश्यक है" : "Name, email and amount required");
      return;
    }
    setBusy(true);
    try {
      const { url } = await checkout({
        data: {
          cause,
          amount,
          currency: "INR",
          donor_name: name.trim(),
          donor_email: email.trim(),
          dedication: dedication.trim() || null,
        },
      });
      window.location.href = url;
    } catch (e: any) {
      setBusy(false);
      toast.error(e?.message ?? "Could not start checkout");
    }
  };

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
            <Flame className="mr-2 h-4 w-4" /> {busy ? (lang === "hi" ? "आगे बढ़ रहा है…" : "Redirecting…") : t("donate_offer")}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {lang === "hi"
              ? "सुरक्षित भुगतान Stripe द्वारा। आपकी दीप तभी प्रज्वलित होगी जब भुगतान पुष्टि होगी।"
              : "Secure payment by Stripe. Your diya lights only after payment is confirmed."}
          </p>
        </Card>
      </section>
    </div>
  );
}
