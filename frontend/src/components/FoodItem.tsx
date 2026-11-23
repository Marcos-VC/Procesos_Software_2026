import { useState } from "react";
import type { Allergen, Food } from "../types";
import { WarningIcon } from "./icons";

// Ficha de un alimento. Cada alérgeno se muestra como una etiqueta con icono de aviso y
// su nombre; al pulsarla se despliega la explicación de la alergia o intolerancia.
interface FoodItemProps {
  food: Food;
  allergenCatalog?: Record<string, Allergen | undefined>;
}

function FoodItem({ food, allergenCatalog = {} }: FoodItemProps) {
  const [openAllergen, setOpenAllergen] = useState<string | null>(null);
  const openInfo = openAllergen ? allergenCatalog[openAllergen] : undefined;
  const blockedNames = (food.blockedBy ?? []).map(
    (allergenId) => allergenCatalog[allergenId]?.name ?? allergenId,
  );

  return (
    <article
      className={`card flex flex-col p-5 sm:p-6 ${
        food.blocked ? "opacity-60" : "card-hover"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-muted">{food.id.slice(0, 8)}</span>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
            {food.calories} kcal
          </span>
        </div>
        <h3 className="mt-4 mb-4 text-xl font-bold text-secondary sm:mt-6 sm:mb-5">{food.name}</h3>

        {food.blocked && (
          <p
            className="mb-5 flex items-start gap-2 rounded-xl bg-warning-soft px-4 py-3 text-sm leading-snug text-warning"
            role="alert"
          >
            <WarningIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              <b>Bloqueado</b>
              {blockedNames.length > 0 && `: contiene ${blockedNames.join(", ")}`}
            </span>
          </p>
        )}
        <div className="grid divide-y divide-line rounded-xl bg-surface px-4 text-sm text-muted">
          <span className="flex items-center justify-between py-2">
            Proteína <b className="text-secondary">{food.protein}g</b>
          </span>
          <span className="flex items-center justify-between py-2">
            Carbohidratos <b className="text-secondary">{food.carbohydrates}g</b>
          </span>
          <span className="flex items-center justify-between py-2">
            Grasas <b className="text-secondary">{food.fat}g</b>
          </span>
        </div>

        {food.allergens.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Alérgenos">
            {food.allergens.map((allergenId) => {
              const info = allergenCatalog[allergenId];
              const name = info?.name ?? allergenId;
              return (
                <li key={allergenId}>
                  <button
                    type="button"
                    className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-secondary transition duration-200 hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-expanded:border-primary aria-expanded:bg-primary-soft sm:min-h-8"
                    aria-label={`Alérgeno: ${name}`}
                    aria-expanded={openAllergen === allergenId}
                    title={name}
                    onClick={() =>
                      setOpenAllergen(openAllergen === allergenId ? null : allergenId)
                    }
                  >
                    <WarningIcon className="size-3.5 shrink-0 text-warning" />
                    {name}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {openAllergen && (
        <p
          className="mt-4 rounded-xl bg-primary-soft px-4 py-3 text-sm leading-snug text-secondary"
          role="tooltip"
        >
          <b>{openInfo?.name ?? openAllergen}</b>
          {openInfo && `: ${openInfo.description}`}
        </p>
      )}
    </article>
  );
}

export default FoodItem;
