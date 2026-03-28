/**
 * WhatsAppReminderButton
 *
 * Self-contained component. Drop anywhere you have tripId, tripName, shareCode.
 * Fetches participants from Supabase, highlights those without preferences,
 * lets the organiser enter phone numbers and fire WhatsApp reminders via Twilio.
 *
 * Required env vars (add to .env):
 *   VITE_TWILIO_ACCOUNT_SID
 *   VITE_TWILIO_AUTH_TOKEN
 *   VITE_TWILIO_WHATSAPP_FROM   e.g. "whatsapp:+14155238886"
 *
 * Usage:
 *   <WhatsAppReminderButton tripId={tripId} tripName={trip.name} shareCode={trip.share_code} />
 */

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { sendWhatsAppReminder } from "../services/whatsappReminderService";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";

interface Props {
  tripId: string;
  tripName: string;
  shareCode: string;
}

interface ParticipantRow {
  id: string;
  name: string;
  email: string | null;
  hasPreferences: boolean;
  phone: string;
  status: "idle" | "sending" | "sent" | "error";
  errorMessage?: string;
}

export function WhatsAppReminderButton({ tripId, tripName, shareCode }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ParticipantRow[]>([]);

  async function openModal() {
    setOpen(true);
    setLoading(true);
    try {
      // Fetch all participants for this trip
      const { data: participants, error: pErr } = await supabase
        .from("trip_participants")
        .select("id, name, email")
        .eq("trip_id", tripId);

      if (pErr) throw pErr;

      // Fetch participant ids that already have preferences
      const { data: prefs, error: prefsErr } = await supabase
        .from("participant_preferences")
        .select("participant_id")
        .in(
          "participant_id",
          (participants ?? []).map((p) => p.id)
        );

      if (prefsErr) throw prefsErr;

      const withPrefs = new Set((prefs ?? []).map((r) => r.participant_id));

      setRows(
        (participants ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          hasPreferences: withPrefs.has(p.id),
          phone: "",
          status: "idle",
        }))
      );
    } catch (err) {
      console.error("WhatsAppReminderButton: failed to load participants", err);
    } finally {
      setLoading(false);
    }
  }

  function updatePhone(id: string, phone: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, phone } : r)));
  }

  async function sendReminder(row: ParticipantRow) {
    if (!row.phone.trim()) return;

    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, status: "sending", errorMessage: undefined } : r))
    );

    const preferencesUrl =
      `${window.location.origin}/trip/${tripId}/preferences/${row.id}`;

    try {
      await sendWhatsAppReminder({
        toPhone: row.phone.trim(),
        participantName: row.name,
        tripName,
        preferencesUrl,
      });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "sent" } : r))
      );
    } catch (err) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, status: "error", errorMessage: String(err) }
            : r
        )
      );
    }
  }

  async function sendAll() {
    const pending = rows.filter((r) => r.phone.trim() && r.status === "idle");
    await Promise.allSettled(pending.map(sendReminder));
  }

  const pending = rows.filter((r) => !r.hasPreferences);
  const hasPhonesEntered = pending.some((r) => r.phone.trim());

  return (
    <>
      <Button variant="ghost" onClick={openModal}>
        Send reminders
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="font-display text-lg font-bold text-ink">
          WhatsApp reminders
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Send a WhatsApp message to participants who haven't filled in their preferences yet.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading participants…</p>
        ) : rows.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No participants found.</p>
        ) : pending.length === 0 ? (
          <p className="mt-6 text-sm text-emerald-400">
            All participants have submitted their preferences!
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-ink">
                      {row.name}
                    </span>
                    {row.email && (
                      <span className="ml-2 text-xs text-slate-500">
                        {row.email}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={row.status} />
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="+447911123456"
                    value={row.phone}
                    onChange={(e) => updatePhone(row.id, e.target.value)}
                    disabled={row.status === "sending" || row.status === "sent"}
                  />
                  <Button
                    variant="secondary"
                    className="shrink-0"
                    disabled={
                      !row.phone.trim() ||
                      row.status === "sending" ||
                      row.status === "sent"
                    }
                    onClick={() => sendReminder(row)}
                  >
                    {row.status === "sending" ? "…" : "Send"}
                  </Button>
                </div>

                {row.status === "error" && (
                  <p className="mt-1 text-xs text-red-400">{row.errorMessage}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <Button
                disabled={!hasPhonesEntered}
                onClick={sendAll}
              >
                Send all
              </Button>
            </div>
          </div>
        )}

        {/* Also show participants who already submitted, collapsed */}
        {rows.filter((r) => r.hasPreferences).length > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            {rows.filter((r) => r.hasPreferences).length} participant(s) have already submitted preferences.
          </p>
        )}
      </Modal>
    </>
  );
}

function StatusBadge({ status }: { status: ParticipantRow["status"] }) {
  if (status === "idle") return null;
  const map = {
    sending: { label: "Sending…", cls: "bg-yellow-500/20 text-yellow-300" },
    sent: { label: "Sent", cls: "bg-emerald-500/20 text-emerald-300" },
    error: { label: "Failed", cls: "bg-red-500/20 text-red-300" },
  } as const;
  const { label, cls } = map[status as keyof typeof map];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
