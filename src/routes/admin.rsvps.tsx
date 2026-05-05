import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/rsvps")({ component: RsvpsAdmin });

function RsvpsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("rsvps").select("*, events(title_en, event_date)").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <Card className="glass border-0 p-6">
      <h2 className="font-serif text-xl">RSVPs ({rows.length})</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="p-2">Event</th><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">When</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t"><td className="p-2">{r.events?.title_en}</td><td className="p-2">{r.name}</td><td className="p-2">{r.email}</td><td className="p-2">{new Date(r.created_at).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
