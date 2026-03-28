import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

type BookingState = {
  transport_booked: boolean;
  accommodation_booked: boolean;
  visa_arranged: boolean;
  insurance_arranged: boolean;
};

type Props = {
  value?: BookingState;
  onSave: (value: BookingState) => void;
  loading?: boolean;
};

const defaultValue: BookingState = {
  transport_booked: false,
  accommodation_booked: false,
  visa_arranged: false,
  insurance_arranged: false
};

export function BookingChecklist({ value, onSave, loading }: Props) {
  const [state, setState] = useState<BookingState>(value ?? defaultValue);

  useEffect(() => {
    if (value) {
      setState(value);
    }
  }, [value]);

  const fields: Array<keyof BookingState> = [
    "transport_booked",
    "accommodation_booked",
    "visa_arranged",
    "insurance_arranged"
  ];

  return (
    <Card className="space-y-3">
      <h3 className="font-display text-lg font-bold">Booking Progress</h3>
      <div className="space-y-2">
        {fields.map((field) => (
          <label key={field} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2 text-sm">
            <input
              type="checkbox"
              checked={state[field]}
              onChange={(event) => setState({ ...state, [field]: event.target.checked })}
            />
            {field.replace(/_/g, " ")}
          </label>
        ))}
      </div>
      <Button disabled={loading} onClick={() => onSave(state)}>
        Save booking progress
      </Button>
    </Card>
  );
}
