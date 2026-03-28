const ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID as string;
const AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN as string;
const FROM_NUMBER = import.meta.env.VITE_TWILIO_WHATSAPP_FROM as string; // e.g. "whatsapp:+14155238886"

export interface ReminderPayload {
  toPhone: string; // E.164 format, e.g. "+447911123456"
  participantName: string;
  tripName: string;
  preferencesUrl: string;
}

export async function sendWhatsAppReminder(payload: ReminderPayload): Promise<void> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) {
    throw new Error(
      "Missing Twilio env vars. Set VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, VITE_TWILIO_WHATSAPP_FROM."
    );
  }

  const message =
    `Hi ${payload.participantName}! You've been invited to join the group trip "${payload.tripName}". ` +
    `Please fill out your travel preferences so we can plan the perfect trip for everyone 🌍\n\n` +
    `${payload.preferencesUrl}`;

  const body = new URLSearchParams({
    From: FROM_NUMBER,
    To: `whatsapp:${payload.toPhone}`,
    Body: message,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`)}`,
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Twilio error ${response.status}`);
  }
}
