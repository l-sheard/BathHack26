import type { ChangeEvent } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export function CheckboxGroup({ label, options, selected, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-slate-700">{label}</legend>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label key={option.value} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  if (event.target.checked) {
                    onChange([...selected, option.value]);
                  } else {
                    onChange(selected.filter((item) => item !== option.value));
                  }
                }}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
