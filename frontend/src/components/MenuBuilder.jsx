import { useEffect, useState } from "react";
import { api } from "../api.js";

const DAYS = [
  ["lunes", "Lunes"],
  ["martes", "Martes"],
  ["miercoles", "Miércoles"],
  ["jueves", "Jueves"],
  ["viernes", "Viernes"],
  ["sabado", "Sábado"],
  ["domingo", "Domingo"],
];
const MEALS = [
  ["desayuno", "Desayuno"],
  ["comida", "Comida"],
  ["cena", "Cena"],
];

// Diseñador de menús: elige un día, un alimento del catálogo y asígnalo a
// Desayuno, Comida o Cena. "Guardar menú" persiste la estructura en el backend.
function MenuBuilder({ userId }) {
  const [foods, setFoods] = useState([]);
  const [days, setDays] = useState(null);
  const [day, setDay] = useState(DAYS[0][0]);
  const [foodId, setFoodId] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    Promise.all([api.getFoods("", userId), api.getMenu(userId)])
      .then(([foodData, menu]) => {
        setFoods(foodData);
        setDays(menu.days);
        setFoodId(foodData.find((food) => !food.blocked)?.id ?? "");
      })
      .catch((error) => setStatus({ type: "error", text: error.message }));
  }, [userId]);

  if (!days) {
    return status ? (
      <p className="text-danger" role="alert">
        {status.text}
      </p>
    ) : (
      <p className="text-muted">Cargando menú...</p>
    );
  }

  const foodsById = new Map(foods.map((food) => [food.id, food]));

  const addFood = (meal) => {
    if (!foodId) return;
    setStatus(null);
    setDays({
      ...days,
      [day]: { ...days[day], [meal]: [...days[day][meal], foodId] },
    });
  };

  const removeFood = (meal, index) => {
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
      setStatus({ type: "error", text: error.message });
    }
  };

  const dayCalories = MEALS.flatMap(([meal]) => days[day][meal]).reduce(
    (total, id) => total + (foodsById.get(id)?.calories ?? 0),
    0,
  );

  return (
    <div className="grid gap-7">
      <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted">
          <span>Día</span>
          <select
            className="input"
            value={day}
            onChange={(event) => setDay(event.target.value)}
          >
            {DAYS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-muted">
          <span>Alimento</span>
          <select
            className="input"
            value={foodId}
            onChange={(event) => setFoodId(event.target.value)}
          >
            {foods.map((food) => (
              <option key={food.id} value={food.id} disabled={food.blocked}>
                {food.name}
                {food.blocked ? ` (bloqueado: ${food.blockedBy.join(", ")})` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3.5 md:grid-cols-3">
        {MEALS.map(([meal, label]) => (
          <section
            className="grid content-start justify-items-start gap-3.5 border border-line bg-white/45 p-5"
            key={meal}
            aria-label={label}
          >
            <h3 className="text-[1.35rem] font-bold">{label}</h3>
            <button type="button" className="btn" onClick={() => addFood(meal)}>
              Añadir a {label}
            </button>
            <ul className="grid w-full gap-2">
              {days[day][meal].map((id, index) => (
                <li
                  key={`${id}-${index}`}
                  className="flex items-center justify-between gap-2"
                >
                  <span>{foodsById.get(id)?.name ?? id}</span>
                  <button
                    type="button"
                    className="cursor-pointer text-[0.8rem] text-danger underline hover:text-danger/70"
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

      <div className="flex items-center justify-between gap-4">
        <p>
          Total del día: <b>{Math.round(dayCalories)} kcal</b>
        </p>
        <button type="button" className="btn" onClick={saveMenu}>
          Guardar menú
        </button>
      </div>
      {status && (
        <p
          className={status.type === "ok" ? "font-bold text-ok" : "text-danger"}
          role={status.type === "ok" ? "status" : "alert"}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}

export default MenuBuilder;
