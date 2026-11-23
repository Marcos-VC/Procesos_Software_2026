import type { Allergen, AllergenId } from "../types";
import { CheckIcon, PlusIcon } from "./icons";

// Selector de alergias (HU 2.2): un chip seleccionable por alérgeno del catálogo.
interface AllergySelectorProps {
  allergenCatalog: Allergen[];
  selected: AllergenId[];
  onChange: (selected: AllergenId[]) => void;
}

function AllergySelector({ allergenCatalog, selected, onChange }: AllergySelectorProps) {
  const toggle = (id: AllergenId) =>
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);

  return (
    <fieldset className="grid w-full gap-3">
      <legend className="mb-1 text-sm font-medium text-secondary">Alergias e intolerancias</legend>
      <div className="flex flex-wrap gap-2">
        {allergenCatalog.map((allergen) => {
          const checked = selected.includes(allergen.id);
          return (
            <label
              key={allergen.id}
              className={`relative flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm sm:min-h-0 font-semibold ring-1 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                checked
                  ? "bg-primary text-white ring-primary"
                  : "bg-white text-secondary ring-black/20 hover:bg-primary-soft"
              }`}
            >
              <input
                type="checkbox"
                className="absolute inset-0 cursor-pointer opacity-0"
                checked={checked}
                onChange={() => toggle(allergen.id)}
              />
              {allergen.name}
              {checked ? (
                <span aria-hidden="true" className="flex items-center gap-1 text-xs font-bold">
                  <CheckIcon className="size-3.5" />
                  Añadida
                </span>
              ) : (
                <PlusIcon className="size-4 text-muted" />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default AllergySelector;
