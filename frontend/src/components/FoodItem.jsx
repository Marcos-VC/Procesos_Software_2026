// Ficha de un alimento del catálogo con su aporte calórico y macronutrientes.
function FoodItem({ food }) {
  return (
    <article className="min-h-56 border border-line bg-white/45 p-5">
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
    </article>
  );
}

export default FoodItem;
