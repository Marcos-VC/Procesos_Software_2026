import { useEffect, useState } from "react";
import { api } from "../api";
import type { CatalogFood, DayKey, MealKey, WeekDays } from "../types";

const DAYS: [DayKey, string][] = [
  ["lunes", "Lunes"],
  ["martes", "Martes"],
  ["miercoles", "Miércoles"],
  ["jueves", "Jueves"],
  ["viernes", "Viernes"],
  ["sabado", "Sábado"],
  ["domingo", "Domingo"],
];
const MEALS: [MealKey, string][] = [
  ["desayuno", "Desayuno"],
  ["comida", "Comida"],
  ["cena", "Cena"],
];

// Diseñador de menús: elige un día, un alimento del catálogo y asígnalo a
// Desayuno, Comida o Cena. "Guardar menú" persiste la estructura en el backend.
interface MenuBuilderProps {
  userId: string;
}

interface Status {
  type: "ok" | "error";
  text: string;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

function MenuBuilder({ userId }: MenuBuilderProps) {
  const [foods, setFoods] = useState<CatalogFood[]>([]);
  const [days, setDays] = useState<WeekDays | null>(null);
  const [day, setDay] = useState<DayKey>(DAYS[0][0]);
  const [foodId, setFoodId] = useState("");
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    Promise.all([api.getFoods("", userId), api.getMenu(userId)])
      .then(([foodData, menu]) => {
        setFoods(foodData);
        setDays(menu.days);
        setFoodId(foodData.find((food) => !food.blocked)?.id ?? "");
      })
      .catch((error: unknown) =>
        setStatus({ type: "error", text: errorMessage(error) }),
      );
  }, [userId]);

  if (!days) {
    return status ? (
      <p className="rounded-xl bg-primary-soft px-4 py-3 text-primary-dark" role="alert">
        {status.text}
      </p>
    ) : (
      <p className="card p-8 text-center text-muted">Cargando menú...</p>
    );
  }

  const foodsById = new Map(foods.map((food) => [food.id, food]));

  const addFood = (meal: MealKey) => {
    if (!foodId) return;
    setStatus(null);
    setDays({
      ...days,
      [day]: { ...days[day], [meal]: [...days[day][meal], foodId] },
    });
  };

  const removeFood = (meal: MealKey, index: number) => {
    setStatus(null);
    setDays({
      ...days,
      [day]: { ...days[day], [meal]: days[day][meal].filter((_, i) => i !== index) },
    });
  };

  const saveMenu = async () => {
    try {
      await api.saveMenu(userId, days);
      setStatus({ type: "ok", text: "Menú guardado correctamente" });
    } catch (error) {
      setStatus({ type: "error", text: errorMessage(error) });
    }
  };

  const dayCalories = MEALS.flatMap(([meal]) => days[day][meal]).reduce(
    (total, id) => total + (foodsById.get(id)?.calories ?? 0),
    0,
  );

  return (
    <div className="grid gap-6">
      <div className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        <label className="grid gap-2 text-sm font-medium text-secondary">
          <span>Día</span>
          <select
            className="input"
            value={day}
            onChange={(event) => setDay(event.target.value as DayKey)}
          >
            {DAYS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-secondary">
          <span>Alimento</span>
          <select
            className="input"
            value={foodId}
            onChange={(event) => setFoodId(event.target.value)}
          >
            {foods.map((food) => (
              <option key={food.id} value={food.id} disabled={food.blocked}>
                {food.name}
                {food.blocked ? ` (bloqueado: ${food.blockedBy?.join(", ")})` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {MEALS.map(([meal, label]) => (
          <section
            className="card grid content-start justify-items-start gap-4 border-t-4 border-t-primary p-6"
            key={meal}
            aria-label={label}
          >
            <h3 className="text-xl font-bold text-secondary">{label}</h3>
            <button type="button" className="btn w-full" onClick={() => addFood(meal)}>
              Añadir a {label}
            </button>
            {days[day][meal].length === 0 && (
              <p className="text-sm text-muted">Sin alimentos todavía</p>
            )}
            <ul className="grid w-full gap-2">
              {days[day][meal].map((id, index) => (
                <li
                  key={`${id}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-xl bg-surface px-4 py-2.5"
                >
                  <span className="font-medium">{foodsById.get(id)?.name ?? id}</span>
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-primary-dark transition hover:bg-primary-soft"
                    aria-label={`Quitar ${foodsById.get(id)?.name ?? id} de ${label}`}
                    onClick={() => removeFood(meal, index)}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="text-lg">
          Total del día: <b className="text-primary-dark">{Math.round(dayCalories)} kcal</b>
        </p>
        <button type="button" className="btn" onClick={saveMenu}>
          Guardar menú
        </button>
      </div>
      {status && (
        <p
          className={
            status.type === "ok"
              ? "rounded-xl bg-ok-soft px-4 py-2.5 font-semibold text-ok"
              : "rounded-xl bg-primary-soft px-4 py-2.5 text-primary-dark"
          }
          role={status.type === "ok" ? "status" : "alert"}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}

export default MenuBuilder;
