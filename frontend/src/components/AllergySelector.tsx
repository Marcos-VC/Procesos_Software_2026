import type { Allergen, AllergenId } from "../types";

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
              className={`relative flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
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
              <span aria-hidden="true">{allergen.icon}</span>
              {allergen.name}
              <span aria-hidden="true" className="font-bold">
                {checked ? "✓ Añadida" : "+"}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default AllergySelector;
