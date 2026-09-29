import { useState } from "react";

// Ficha de un alimento. Cada alérgeno se muestra como icono; al pulsarlo se
// despliega el nombre de la alergia o intolerancia y su explicación.
function FoodItem({ food, allergenCatalog }) {
  const [openAllergen, setOpenAllergen] = useState(null);
  const openInfo = allergenCatalog[openAllergen];

  return (
    <article
      className={`min-h-56 border bg-white/45 p-5 ${
        food.blocked ? "border-accent opacity-60" : "border-line"
      }`}
    >
      <div className="flex justify-between gap-2 text-xs">
        <span className="text-muted">{food.id.slice(0, 8)}</span>
        <span className="font-bold text-accent">{food.calories} kcal</span>
      </div>
      <h3 className="mt-9 mb-7 text-[1.35rem] font-bold">{food.name}</h3>
      <div className="flex items-end justify-between gap-2 text-xs text-muted">
        <span className="grid gap-1">
          Proteína <b className="text-sm text-ink">{food.protein}g</b>
        </span>
        <span className="grid gap-1">
          Carbohidratos <b className="text-sm text-ink">{food.carbohydrates}g</b>
        </span>
        <span className="grid gap-1">
          Grasas <b className="text-sm text-ink">{food.fat}g</b>
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
                  className="cursor-pointer border border-line bg-white px-2.5 py-1.5 text-lg leading-none hover:border-accent hover:bg-accent-soft aria-expanded:border-accent aria-expanded:bg-accent-soft"
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

      {openAllergen && (
        <p
          className="mt-3 bg-accent-soft px-3 py-2.5 text-[0.8rem] leading-snug"
          role="tooltip"
        >
          <b>{openInfo?.name ?? openAllergen}</b>
          {openInfo && `: ${openInfo.description}`}
        </p>
      )}

      {food.blocked && (
        <p className="mt-5 text-[0.8rem] font-bold text-danger">
          Bloqueado por tu perfil: {food.blockedBy.join(", ")}
        </p>
      )}
    </article>
  );
}

export default FoodItem;
