import { useState } from "react";
import type { Allergen, Food } from "../types";

// Ficha de un alimento. Cada alérgeno se muestra como icono; al pulsarlo se
// despliega el nombre de la alergia o intolerancia y su explicación.
interface FoodItemProps {
  food: Food;
  allergenCatalog?: Record<string, Allergen | undefined>;
  isCompatible?: boolean;
}

function FoodItem({ food, allergenCatalog = {}, isCompatible = true }: FoodItemProps) {
  const [openAllergen, setOpenAllergen] = useState<string | null>(null);
  const openInfo = openAllergen ? allergenCatalog[openAllergen] : undefined;

  return (
    <article
      className={`card flex flex-col p-6 ${
        isCompatible ? "card-hover" : "opacity-70 ring-1 ring-black/10"
      }`}
      aria-label={isCompatible ? food.name : `${food.name}, no compatible con tu dieta`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-muted">{food.id.slice(0, 8)}</span>
          <div className="flex items-center gap-2">
            {!isCompatible && (
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                No compatible con tu dieta
              </span>
            )}
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
              {food.calories} kcal
            </span>
          </div>
        </div>
        <h3 className="mt-6 mb-5 text-xl font-bold text-secondary">{food.name}</h3>
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
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Alérgenos">
            {food.allergens.map((allergenId) => {
              const info = allergenCatalog[allergenId];
              const name = info?.name ?? allergenId;
              return (
                <li key={allergenId}>
                  <button
                    type="button"
                    className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-lg leading-none transition duration-200 hover:scale-110 hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-expanded:border-primary aria-expanded:bg-primary-soft"
                    aria-label={`Alérgeno: ${name}`}
                    aria-expanded={openAllergen === allergenId}
                    title={name}
                    onClick={() =>
                      setOpenAllergen(openAllergen === allergenId ? null : allergenId)
                    }
                  >
                    {info?.icon ?? "⚠️"}
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
