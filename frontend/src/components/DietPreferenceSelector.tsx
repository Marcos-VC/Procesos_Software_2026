import { DIET_OPTIONS, type DietType } from "../types";

// Selector de preferencias dietéticas (HU 2.3): muestra las dietas disponibles y permite seleccionar una.
interface DietPreferenceSelectorProps {
  selected: DietType | string;
  onChange: (dietType: DietType) => void;
}

function DietPreferenceSelector({ selected, onChange }: DietPreferenceSelectorProps) {
  return (
    <fieldset className="grid w-full gap-3" aria-label="Preferencias dietéticas">
      <legend className="mb-1 text-sm font-medium text-secondary">
        Preferencia dietética
      </legend>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {DIET_OPTIONS.map((option) => {
          const checked = selected === option.id;
          return (
            <label
              key={option.id}
              className={`relative flex cursor-pointer items-start gap-3 rounded-2xl p-3.5 ring-1 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                checked
                  ? "bg-primary-soft/50 ring-2 ring-primary shadow-sm"
                  : "bg-surface ring-black/10 hover:bg-black/5 hover:ring-black/20"
              }`}
            >
              <input
                type="radio"
                name="dietType"
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="mt-0.5 size-4 accent-primary cursor-pointer"
              />
              <div className="grid gap-0.5 text-left">
                <span className="flex items-center gap-1.5 text-sm font-bold text-secondary">
                  <span aria-hidden="true" className="text-base">{option.icon}</span>
                  {option.name}
                  {checked && (
                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Activa
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted leading-relaxed">
                  {option.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default DietPreferenceSelector;

