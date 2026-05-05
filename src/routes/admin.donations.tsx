import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/donations")({ component: DonationsAdmin });

function DonationsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("donations").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);
  const total = rows.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.amount), 0);
  return (
    <Card className="glass border-0 p-6">
      <h2 className="font-serif text-xl">Donations ({rows.length}) · ₹{total.toLocaleString()} received</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="p-2">Ref</th><th className="p-2">Donor</th><th className="p-2">Cause</th><th className="p-2">Amount</th><th className="p-2">Status</th><th className="p-2">When</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2"><Link to="/receipt/$ref" params={{ ref: r.reference_id }} className="text-primary hover:underline">{r.reference_id}</Link></td>
                <td className="p-2">{r.donor_name}<div className="text-xs text-muted-foreground">{r.donor_email}</div></td>
                <td className="p-2">{r.cause}</td>
                <td className="p-2">₹{Number(r.amount).toLocaleString()}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
