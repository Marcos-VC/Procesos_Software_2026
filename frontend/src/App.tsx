import { useEffect, useState } from "react";
import { api, demoUserId } from "./api";
import FoodList from "./components/FoodList";
import MenuBuilder from "./components/MenuBuilder";
import ProfileEditor from "./components/ProfileEditor";
import SearchBar from "./components/SearchBar";
import SectionHeading from "./components/SectionHeading";
import type { Allergen, CatalogFood, DailySummary, UserProfile } from "./types";

type Tab = "catalogo" | "perfil" | "menu";

const TABS: [Tab, string][] = [
  ["catalogo", "Catálogo"],
  ["perfil", "Perfil"],
  ["menu", "Menú"],
];

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card relative grid gap-2 overflow-hidden p-5 pl-6">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-primary" aria-hidden="true" />
      <span className="text-xs font-semibold tracking-wider text-muted uppercase">
        {label}
      </span>
      <strong className="font-display text-xl break-words text-secondary">{value}</strong>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>("catalogo");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [foods, setFoods] = useState<CatalogFood[] | null>(null);
  const [query, setQuery] = useState("");
  // Se incrementa al guardar el perfil para recargar el catálogo con los bloqueos nuevos.
  const [profileVersion, setProfileVersion] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.getProfile(demoUserId),
      api.getSummary(demoUserId),
      api.getAllergens(),
    ])
      .then(([userData, summaryData, allergenData]) => {
        setUser(userData);
        setSummary(summaryData);
        setAllergens(allergenData);
      })
      .catch(() => setError("No se pudo conectar con el backend."));
  }, []);

  useEffect(() => {
    let ignore = false;
    api
      .getFoods(query, demoUserId)
      .then((data) => {
        if (!ignore) setFoods(data);
      })
      .catch(() => setError("No se pudo conectar con el backend."));
    return () => {
      ignore = true;
    };
  }, [query, profileVersion]);

  const allergenCatalog = Object.fromEntries(
    allergens.map((allergen) => [allergen.id, allergen]),
  );

  const handleProfileSaved = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setProfileVersion((version) => version + 1);
  };

  return (
    <main className="min-h-screen pb-24">
      <header className="relative overflow-hidden bg-linear-to-br from-secondary via-secondary to-secondary-soft text-white">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="page relative pt-16 pb-36 sm:pt-24">
          <p className="mb-6 inline-flex rounded-full bg-primary px-4 py-1.5 text-xs font-bold tracking-widest text-white shadow-lg shadow-primary/30">
            HEALTHY LIFE / E6
          </p>
          <h1 className="max-w-3xl text-5xl leading-[0.95] font-bold sm:text-7xl lg:text-8xl">
            Come con <span className="text-primary-light">criterio.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75">
            Catálogo de alimentos y decisiones nutricionales adaptadas a cada
            persona.
          </p>
        </div>
      </header>

      <section
        className="page relative z-10 -mt-20 grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-5"
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

      <nav className="page pb-10" aria-label="Secciones">
        <div className="inline-flex flex-wrap gap-1 rounded-full bg-white p-1.5 shadow-lg ring-1 ring-black/5">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                tab === id
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-secondary hover:bg-primary-soft"
              }`}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <section className="page">
        {error && (
          <p className="mb-6 rounded-xl bg-primary-soft px-4 py-3 text-primary-dark">
            {error}
          </p>
        )}

        {tab === "catalogo" && (
          <>
            <SectionHeading eyebrow="CATÁLOGO" title="Alimentos disponibles">
              <SearchBar onSearch={setQuery} />
            </SectionHeading>
            <FoodList foods={foods} allergenCatalog={allergenCatalog} />
          </>
        )}

        {tab === "perfil" && (
          <>
            <SectionHeading eyebrow="PERFIL" title="Perfil nutricional" />
            {user && allergens.length > 0 && (
              <ProfileEditor
                user={user}
                allergens={allergens}
                onSaved={handleProfileSaved}
              />
            )}
          </>
        )}

        {tab === "menu" && (
          <>
            <SectionHeading eyebrow="MENÚ" title="Diseñador de menús" />
            <MenuBuilder userId={demoUserId} />
          </>
        )}
      </section>
    </main>
  );
}

export default App;
