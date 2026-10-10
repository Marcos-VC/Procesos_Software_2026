import { useEffect, useState } from "react";
import { api } from "../api";
import type { DayKey, Food, MealKey, WeekDays } from "../types";

const DAYS: [DayKey, string][] = [
  ["lunes", "Lunes"],
  ["martes", "Martes"],
  ["miercoles", "Miércoles"],
  ["jueves", "Jueves"],
  ["viernes", "Viernes"],
  ["sabado", "Sábado"],
  ["domingo", "Domingo"],
];
const MEALS: [MealKey, string, string][] = [
  ["desayuno", "Desayuno", "🌅"],
  ["comida", "Comida", "🍽️"],
  ["cena", "Cena", "🌙"],
];

// Diseñador de menús: la semana se ve de un vistazo (cada día muestra sus calorías).
// En cada comida del día elegido se pulsa "Añadir alimento", se busca en el catálogo y
// con un clic queda añadido. "Guardar menú" persiste la estructura en el backend.
interface MenuBuilderProps {
  userId: string;
  /** Objetivo calórico diario del perfil; si existe se muestra como referencia. */
  caloricGoal?: number;
}

interface Status {
  type: "ok" | "error";
  text: string;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

// Minúsculas y sin tildes, para que "salmon" encuentre "Salmón".
const plain = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function MenuBuilder({ userId, caloricGoal }: MenuBuilderProps) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [days, setDays] = useState<WeekDays | null>(null);
  // Menú tal y como está guardado, para avisar de que hay cambios sin guardar.
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [day, setDay] = useState<DayKey>("lunes");
  // Comida cuyo selector de alimentos está abierto (solo una a la vez).
  const [openMeal, setOpenMeal] = useState<MealKey | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    Promise.all([api.getFoods(""), api.getMenu(userId)])
      .then(([foodData, menu]) => {
        setFoods(foodData);
        setDays(menu.days);
        setSavedSnapshot(JSON.stringify(menu.days));
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
  const caloriesOf = (ids: string[]) =>
    ids.reduce((total, id) => total + (foodsById.get(id)?.calories ?? 0), 0);
  const dayCalories = (key: DayKey) =>
    Math.round(MEALS.reduce((total, [meal]) => total + caloriesOf(days[key][meal]), 0));

  const dayLabel = DAYS.find(([key]) => key === day)?.[1] ?? "";
  const todayKcal = dayCalories(day);
  const goalPercent = caloricGoal ? Math.round((todayKcal / caloricGoal) * 100) : 0;
  const overGoal = caloricGoal !== undefined && todayKcal > caloricGoal;
  const dirty = JSON.stringify(days) !== savedSnapshot;

  const selectDay = (key: DayKey) => {
    setDay(key);
    setOpenMeal(null);
  };

  const togglePicker = (meal: MealKey) => {
    setOpenMeal(openMeal === meal ? null : meal);
    setSearch("");
  };

  const addFood = (meal: MealKey, foodId: string) => {
    setStatus(null);
    setOpenMeal(null);
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
      setSavedSnapshot(JSON.stringify(days));
      setStatus({ type: "ok", text: "Menú guardado correctamente" });
    } catch (error) {
      setStatus({ type: "error", text: errorMessage(error) });
    }
  };

  const results = foods.filter((food) => plain(food.name).includes(plain(search.trim())));

  return (
    <div className="grid gap-6">
      {/* Semana: un botón por día con sus calorías. */}
      <div
        className="grid grid-cols-4 gap-2 sm:grid-cols-7"
        role="group"
        aria-label="Día de la semana"
      >
        {DAYS.map(([key, label]) => {
          const kcal = dayCalories(key);
          const selected = key === day;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => selectDay(key)}
              className={`grid cursor-pointer gap-0.5 rounded-2xl px-2 py-3 text-center transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selected
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "card hover:-translate-y-0.5 hover:bg-primary-soft"
              }`}
            >
              <span className="font-display text-sm font-bold">{label}</span>
              <span className={`text-xs ${selected ? "text-white/85" : "text-muted"}`}>
                {kcal > 0 ? `${kcal} kcal` : "Vacío"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resumen del día seleccionado, con el objetivo calórico como referencia. */}
      <div className="card p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">
              Menú del día
            </p>
            <h3 className="text-2xl font-bold text-secondary">{dayLabel}</h3>
          </div>
          <p className="text-sm text-muted">
            <b className={`font-display text-2xl ${overGoal ? "text-warning" : "text-secondary"}`}>
              {todayKcal}
            </b>
            {caloricGoal ? ` de ${caloricGoal} kcal` : " kcal"}
          </p>
        </div>
        {caloricGoal ? (
          <div
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface"
            aria-hidden="true"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                overGoal ? "bg-warning" : "bg-primary"
              }`}
              style={{ width: `${Math.min(100, goalPercent)}%` }}
            />
          </div>
        ) : null}
        <p className="mt-3 text-xs text-muted">
          Estimación contando 100 g de cada alimento.
        </p>
      </div>

      {/* Las tres comidas del día. */}
      <div className="grid gap-5 md:grid-cols-3 md:items-start">
        {MEALS.map(([meal, label, icon]) => {
          const items = days[day][meal];
          const isOpen = openMeal === meal;
          return (
            <section
              className="card flex flex-col gap-4 border-t-4 border-t-primary p-5"
              key={meal}
              aria-label={label}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 font-display text-xl font-bold text-secondary">
                  <span aria-hidden="true">{icon}</span>
                  {label}
                </h4>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
                  {Math.round(caloriesOf(items))} kcal
                </span>
              </div>

              {items.length === 0 && (
                <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">
                  Todavía no hay nada en esta comida.
                </p>
              )}
              {items.length > 0 && (
                <ul className="grid gap-2">
                  {items.map((id, index) => (
                    <li
                      key={`${id}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-xl bg-surface px-4 py-2.5"
                    >
                      <span className="font-medium">{foodsById.get(id)?.name ?? id}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted">
                          {foodsById.get(id)?.calories ?? 0} kcal
                        </span>
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-primary-dark transition hover:bg-primary-soft"
                          aria-label={`Quitar ${foodsById.get(id)?.name ?? id} de ${label}`}
                          onClick={() => removeFood(meal, index)}
                        >
                          Quitar
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line px-4 py-3 text-sm font-semibold text-primary-dark transition duration-200 hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-expanded:border-primary aria-expanded:bg-primary-soft"
                aria-expanded={isOpen}
                onClick={() => togglePicker(meal)}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {isOpen ? "−" : "+"}
                </span>
                Añadir alimento
              </button>

              {isOpen && (
                <div className="rounded-xl border border-line bg-white p-3 shadow-lg">
                  <input
                    className="input mb-2 py-2 text-sm"
                    autoFocus
                    aria-label={`Buscar alimento para ${label}`}
                    placeholder="Buscar alimento..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setOpenMeal(null);
                    }}
                  />
                  {results.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted">Sin resultados</p>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto">
                      {results.map((food) => (
                        <li key={food.id}>
                          <button
                            type="button"
                            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-primary-soft"
                            onClick={() => addFood(meal, food.id)}
                          >
                            <span className="font-medium">{food.name}</span>
                            <span className="text-xs text-muted">{food.calories} kcal</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <p className={`text-sm ${dirty ? "font-semibold text-warning" : "text-muted"}`}>
          {dirty ? "Tienes cambios sin guardar" : "Todos los cambios están guardados"}
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
