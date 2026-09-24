import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${apiUrl}/api/foods`).then((response) => response.json()),
      fetch(`${apiUrl}/api/users/user-001`).then((response) => response.json()),
    ])
      .then(([foodData, userData]) => {
        setFoods(foodData);
        setUser(userData);
      })
      .catch(() => setError("No se pudo conectar con el backend."));
  }, []);

  const visibleFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">HEALTHY LIFE / E6</p>
        <h1>Come con criterio.</h1>
        <p className="lead">
          Catálogo de alimentos y decisiones nutricionales adaptadas a cada
          persona.
        </p>
      </header>

      <section className="profile-strip" aria-label="Perfil nutricional">
        <div>
          <span>Perfil activo</span>
          <strong>{user?.userId || "Cargando..."}</strong>
        </div>
        <div>
          <span>Peso</span>
          <strong>{user ? `${user.weight} kg` : "..."}</strong>
        </div>
        <div>
          <span>Objetivo diario</span>
          <strong>{user ? `${user.caloricGoal} kcal` : "..."}</strong>
        </div>
        <div>
          <span>Evitar</span>
          <strong>
            {user?.medicalRestrictions?.allergies?.join(", ") || "..."}
          </strong>
        </div>
      </section>

      <section className="catalogue">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CATÁLOGO</p>
            <h2>Alimentos disponibles</h2>
          </div>
          <label>
            <span className="sr-only">Buscar alimento</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar alimento"
            />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="food-grid">
          {visibleFoods.map((food) => (
            <article className="food-card" key={food.id}>
              <div className="food-topline">
                <span className="food-id">{food.id}</span>
                <span className="kcal">{food.calories} kcal</span>
              </div>
              <h3>{food.name}</h3>
              <div className="macros">
                <span>
                  Proteína <b>{food.protein}g</b>
                </span>
                <span>
                  Carbohidratos <b>{food.carbohydrates}g</b>
                </span>
                <span>
                  Grasas <b>{food.fat}g</b>
                </span>
              </div>
              {food.allergens.length > 0 && (
                <p className="allergen">
                  Alérgeno: {food.allergens.join(", ")}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
