import { useEffect, useState } from "react";
import { api, demoUserId } from "./api.js";
import FoodList from "./components/FoodList.jsx";
import SearchBar from "./components/SearchBar.jsx";
import SectionHeading from "./components/SectionHeading.jsx";

function ProfileStat({ label, value }) {
  return (
    <div className="grid gap-2 bg-sage p-5">
      <span className="text-xs tracking-wider text-muted uppercase">{label}</span>
      <strong className="font-display text-lg break-words">{value}</strong>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [foods, setFoods] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getProfile(demoUserId), api.getSummary(demoUserId)])
      .then(([userData, summaryData]) => {
        setUser(userData);
        setSummary(summaryData);
      })
      .catch(() => setError("No se pudo conectar con el backend."));
  }, []);

  useEffect(() => {
    let ignore = false;
    api
      .getFoods(query)
      .then((data) => {
        if (!ignore) setFoods(data);
      })
      .catch(() => setError("No se pudo conectar con el backend."));
    return () => {
      ignore = true;
    };
  }, [query]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_85%_8%,#d6e7c4_0,transparent_28rem)] pb-20">
      <header className="page pt-12 pb-16 sm:pt-20">
        <p className="mb-3.5 text-xs font-bold tracking-widest text-accent">
          HEALTHY LIFE / E6
        </p>
        <h1 className="max-w-3xl text-[clamp(3.4rem,8vw,7.5rem)] leading-[0.9] font-bold">
          Come con criterio.
        </h1>
        <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted">
          Catálogo de alimentos y decisiones nutricionales adaptadas a cada
          persona.
        </p>
      </header>

      <section
        className="page grid grid-cols-1 gap-px pb-12 sm:grid-cols-2 lg:grid-cols-5"
        aria-label="Perfil nutricional"
      >
        <ProfileStat
          label="Perfil activo"
          value={user ? user.userId.slice(0, 8) : "Cargando..."}
        />
        <ProfileStat label="Peso" value={user ? `${user.weight} kg` : "..."} />
        <ProfileStat
          label="Objetivo diario"
          value={user ? `${user.caloricGoal} kcal` : "..."}
        />
        <ProfileStat
          label="Consumido hoy"
          value={summary ? `${summary.totalCaloriesConsumed} kcal` : "..."}
        />
        <ProfileStat
          label="Evitar"
          value={
            user ? user.medicalRestrictions.allergies.join(", ") || "Nada" : "..."
          }
        />
      </section>

      <section className="page">
        {error && <p className="mb-4 text-danger">{error}</p>}

        <SectionHeading eyebrow="CATÁLOGO" title="Alimentos disponibles">
          <SearchBar onSearch={setQuery} />
        </SectionHeading>
        <FoodList foods={foods} />
      </section>
    </main>
  );
}

export default App;
