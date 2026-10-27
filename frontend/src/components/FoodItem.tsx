import { useState } from "react";
import type { Allergen, Food } from "../types";

// Ficha de un alimento. Cada alérgeno se muestra como icono; al pulsarlo se
// despliega el nombre de la alergia o intolerancia y su explicación.
interface FoodItemProps {
  food: Food;
  allergenCatalog?: Record<string, Allergen | undefined>;
}

function FoodItem({ food, allergenCatalog = {} }: FoodItemProps) {
  const [openAllergen, setOpenAllergen] = useState<string | null>(null);
  const openInfo = openAllergen ? allergenCatalog[openAllergen] : undefined;

  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-lg bg-surface px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide text-muted">
            {food.id.slice(0, 8)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary-dark">
            <span aria-hidden="true">🔥</span>
            {food.calories} kcal
          </span>
        </div>

        <h3 className="mt-7 mb-5 text-2xl font-bold leading-tight text-secondary">
          {food.name}
        </h3>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface p-2">
          <span className="flex flex-col gap-1 rounded-xl bg-white px-3 py-2.5 text-xs text-muted shadow-sm">
            <span>Proteína</span>
            <b className="text-base text-secondary">{food.protein}g</b>
          </span>
          <span className="flex flex-col gap-1 rounded-xl bg-white px-3 py-2.5 text-xs text-muted shadow-sm">
            <span>Carbohidratos</span>
            <b className="text-base text-secondary">{food.carbohydrates}g</b>
          </span>
          <span className="flex flex-col gap-1 rounded-xl bg-white px-3 py-2.5 text-xs text-muted shadow-sm">
            <span>Grasas</span>
            <b className="text-base text-secondary">{food.fat}g</b>
          </span>
        </div>

        {food.allergens.length > 0 && (
          <div className="mt-auto pt-6">
            <div className="rounded-2xl border border-primary/15 bg-primary-soft/60 p-3.5">
              <p className="mb-2 text-[11px] font-bold tracking-wider text-primary-dark uppercase">
                Contiene alérgenos
              </p>
              <ul className="flex flex-wrap gap-2" aria-label="Alérgenos">
                {food.allergens.map((allergenId) => {
                  const info = allergenCatalog[allergenId];
                  const name = info?.name ?? allergenId;
                  return (
                    <li key={allergenId}>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-white px-2.5 py-1.5 text-sm leading-none shadow-sm transition duration-200 hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-expanded:border-primary aria-expanded:bg-primary-soft"
                        aria-label={`Alérgeno: ${name}`}
                        aria-expanded={openAllergen === allergenId}
                        title={name}
                        onClick={() =>
                          setOpenAllergen(openAllergen === allergenId ? null : allergenId)
                        }
                      >
                        <span aria-hidden="true">{info?.icon ?? "⚠️"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>

      {openAllergen && (
        <p
          className="border-t border-primary/15 bg-primary-soft px-6 py-4 text-sm leading-snug text-secondary"
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
