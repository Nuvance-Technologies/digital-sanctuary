import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Home } from "lucide-react";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/receipt/$ref")({
  component: ReceiptPage,
  head: () => ({
    meta: [
      { title: "Donation Receipt — Shri Meera Mai Ashram" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Donation = {
  reference_id: string;
  cause: string;
  amount: number;
  currency: string;
  donor_name: string;
  donor_email: string;
  dedication: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
};

function ReceiptPage() {
  const { ref } = Route.useParams();
  const { lang } = useI18n();
  const [d, setD] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("donations").select("*").eq("reference_id", ref).maybeSingle().then(({ data }) => {
      setD(data as Donation | null);
      setLoading(false);
    });
  }, [ref]);

  const downloadPdf = () => {
    if (!d) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Shri Meera Mai Ashram", 20, 25);
    doc.setFontSize(11);
    doc.text("Kapildhara, Amarkantak, Madhya Pradesh", 20, 32);
    doc.line(20, 38, 190, 38);
    doc.setFontSize(16);
    doc.text("Donation Receipt", 20, 50);
    doc.setFontSize(11);
    const rows: [string, string][] = [
      ["Reference ID", d.reference_id],
      ["Date", new Date(d.paid_at ?? d.created_at).toLocaleString()],
      ["Donor", d.donor_name],
      ["Email", d.donor_email],
      ["Cause", d.cause],
      ["Amount", `${d.currency} ${d.amount}`],
      ["Status", d.status.toUpperCase()],
    ];
    let y = 62;
    rows.forEach(([k, v]) => {
      doc.text(`${k}:`, 20, y);
      doc.text(String(v), 70, y);
      y += 8;
    });
    if (d.dedication) {
      y += 4;
      doc.text("Sankalp:", 20, y);
      doc.text(doc.splitTextToSize(d.dedication, 110), 70, y);
    }
    doc.setFontSize(9);
    doc.text("Om Namo Narayanaya · Narmade Har", 20, 280);
    doc.save(`receipt-${d.reference_id}.pdf`);
  };

  if (loading) return <div className="px-4 py-20 text-center text-muted-foreground">…</div>;
  if (!d) return (
    <div className="px-4 py-20 text-center">
      <p>Receipt not found.</p>
      <Button asChild className="mt-4"><Link to="/">Home</Link></Button>
    </div>
  );

  return (
    <div className="px-4">
      <section className="mx-auto max-w-2xl pt-12 pb-32">
        <Card className="glass border-0 p-8">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-primary">{lang === "hi" ? "दान रसीद" : "Donation Receipt"}</div>
            <h1 className="mt-1 font-serif text-3xl">Shri Meera Mai Ashram</h1>
            <p className="text-sm text-muted-foreground">Kapildhara, Amarkantak</p>
          </div>
          <dl className="mt-6 divide-y divide-border/50 text-sm">
            {[
              ["Reference", d.reference_id],
              ["Date", new Date(d.paid_at ?? d.created_at).toLocaleString()],
              ["Donor", d.donor_name],
              ["Email", d.donor_email],
              ["Cause", d.cause],
              ["Amount", `${d.currency} ${Number(d.amount).toLocaleString()}`],
              ["Status", d.status.toUpperCase()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
            {d.dedication && (
              <div className="py-3">
                <dt className="text-muted-foreground">Sankalp</dt>
                <dd className="mt-1 font-serif italic">"{d.dedication}"</dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={downloadPdf} className="bg-primary text-primary-foreground hover:bg-primary/90"><Download className="mr-2 h-4 w-4" />Download PDF</Button>
            <Button asChild variant="outline" className="glass"><Link to="/"><Home className="mr-2 h-4 w-4" />Home</Link></Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
