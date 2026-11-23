import { useEffect, useRef, useState, type ComponentType } from "react";
import { api, demoUserId } from "./api";
import FoodList from "./components/FoodList";
import FoodForm from "./components/FoodForm";
import {
  BagIcon,
  BoxIcon,
  CalendarIcon,
  DotIcon,
  GridIcon,
  UserIcon,
  type IconProps,
} from "./components/icons";
import MenuBuilder from "./components/MenuBuilder";
import ProfileEditor from "./components/ProfileEditor";
import SearchBar from "./components/SearchBar";
import SectionHeading from "./components/SectionHeading";
import { DIET_OPTIONS, type Allergen, type DailySummary, type Food, type UserProfile } from "./types";

type Tab = "catalogo" | "perfil" | "menu";

const TABS: [Tab, string][] = [
  ["catalogo", "Catálogo"],
  ["perfil", "Perfil"],
  ["menu", "Menú"],
];

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card relative grid content-start gap-0.5 overflow-hidden p-3 pl-4 sm:gap-2 sm:p-5 sm:pl-6">
      <span className="absolute inset-y-0 left-0 w-1 bg-primary sm:w-1.5" aria-hidden="true" />
      <span className="text-[11px] font-semibold tracking-wider text-muted uppercase sm:text-xs">
        {label}
      </span>
      <strong className="font-display text-lg break-words text-secondary sm:text-xl">{value}</strong>
    </div>
  );
}

// Icono de cada pestaña en la barra inferior del móvil. Incluye las pestañas de Despensa y
// Compra de las HU 4.1 y 5.1; una pestaña sin entrada aquí usa el icono genérico.
const TAB_ICONS: Partial<Record<string, ComponentType<IconProps>>> = {
  catalogo: GridIcon,
  perfil: UserIcon,
  menu: CalendarIcon,
  despensa: BoxIcon,
  compra: BagIcon,
};

function App() {
  const [tab, setTab] = useState<Tab>("catalogo");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const contentRef = useRef<HTMLElement>(null);

  // En móvil las pestañas están fijas abajo y se pueden pulsar desde cualquier punto de la
  // página: si ya se había pasado el inicio del contenido, se vuelve al principio de la
  // nueva sección en vez de quedarse a mitad (o al final) de ella.
  useEffect(() => {
    const content = contentRef.current;
    if (content && content.getBoundingClientRect().top < 0) {
      content.scrollIntoView({ block: "start" });
    }
  }, [tab]);

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
      .catch((error: unknown) =>
        setError(error instanceof Error ? error.message : "No se pudo conectar con el backend."),
      );
  }, []);

  useEffect(() => {
    let ignore = false;
    api
      .getFoods(query, demoUserId)
      .then((data) => {
        if (!ignore) setFoods(data);
      })
      .catch((error: unknown) =>
        setError(error instanceof Error ? error.message : "No se pudo conectar con el backend."),
      );
    return () => {
      ignore = true;
    };
    // `user` cambia al guardar el perfil: así blocked/blockedBy reflejan las alergias nuevas.
  }, [query, user]);

  const allergenCatalog = Object.fromEntries(
    allergens.map((allergen) => [allergen.id, allergen]),
  );
  const activeDiet = DIET_OPTIONS.find(
    (option) => option.id === user?.medicalRestrictions?.dietType,
  );

  return (
    <main className="min-h-screen pb-24">
      <header className="relative overflow-hidden bg-linear-to-br from-secondary via-secondary to-secondary-soft text-white">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="page relative pt-8 pb-24 sm:pt-24 sm:pb-36">
          <p className="mb-4 inline-flex rounded-full bg-primary px-3 py-1 text-[11px] font-bold tracking-widest text-white shadow-lg shadow-primary/30 sm:mb-6 sm:px-4 sm:py-1.5 sm:text-xs">
            HEALTHY LIFE / E6
          </p>
          <h1 className="max-w-3xl text-[2.625rem] leading-[0.95] font-bold sm:text-7xl lg:text-8xl">
            Come con <span className="text-primary-light">criterio.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:mt-7 sm:text-lg">
            Catálogo de alimentos y decisiones nutricionales adaptadas a cada
            persona.
          </p>
        </div>
      </header>

      <section
        className="page relative z-10 -mt-16 grid grid-cols-2 gap-2.5 pb-6 sm:-mt-20 sm:gap-4 sm:pb-10 lg:grid-cols-5 [&>:last-child]:col-span-2 lg:[&>:last-child]:col-span-1"
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
          label="Preferencia dietética"
          value={user && activeDiet ? `${activeDiet.icon} ${activeDiet.name}` : "..."}
        />
      </section>

      {/* Pestañas. En móvil: barra fija abajo, al alcance del pulgar, con las pestañas a partes
          iguales (icono + nombre), así caben de 3 a 5 sin partirse ni desplazarse. Desde sm:
          la barra de pastilla bajo el perfil. */}
      <nav
        className="page fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur-md sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:px-8 sm:pb-10 sm:shadow-none sm:backdrop-blur-none"
        aria-label="Secciones"
      >
        <div className="mx-auto grid max-w-md auto-cols-fr grid-flow-col sm:mx-0 sm:inline-flex sm:max-w-none sm:flex-wrap sm:gap-1 sm:rounded-full sm:bg-white sm:p-1.5 sm:shadow-lg sm:ring-1 sm:ring-black/5">
          {TABS.map(([id, label]) => {
            const TabIcon = TAB_ICONS[id] ?? DotIcon;
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                className={`flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-1 pt-1.5 pb-1 text-[11px] font-semibold transition duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:min-h-0 sm:flex-row sm:rounded-full sm:px-6 sm:py-2.5 sm:text-sm sm:focus-visible:outline-offset-2 ${
                  active
                    ? "text-primary-dark sm:bg-primary sm:text-white sm:shadow-md sm:shadow-primary/30"
                    : "text-muted hover:text-secondary sm:text-secondary sm:hover:bg-primary-soft"
                }`}
                aria-current={active ? "page" : undefined}
                onClick={() => setTab(id)}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition duration-200 sm:hidden ${
                    active ? "bg-primary-soft" : ""
                  }`}
                >
                  <TabIcon className="size-5" />
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <section ref={contentRef} className="page scroll-mt-4">
        {error && (
          <p className="mb-6 rounded-xl bg-primary-soft px-4 py-3 text-primary-dark">
            {error}
          </p>
        )}

        {tab === "catalogo" && (
          <>
            <SectionHeading eyebrow="CATÁLOGO" title="Alimentos disponibles">
              <div className="flex flex-wrap items-center gap-3">
                <SearchBar onSearch={setQuery} />
                <FoodForm
                  allergens={allergens}
                  onCreated={(food) => setFoods((current) => (current ? [food, ...current] : [food]))}
                />
              </div>
            </SectionHeading>
            {activeDiet && activeDiet.id !== "omnivore" && (
              <p className="mb-6 flex items-center gap-1.5 text-sm text-muted">
                <span aria-hidden="true">ℹ️</span>
                Se ocultan los alimentos que no encajan con tu dieta {activeDiet.name.toLowerCase()}.
              </p>
            )}
            <FoodList
              foods={foods}
              allergenCatalog={allergenCatalog}
              dietType={user?.medicalRestrictions?.dietType}
            />
          </>
        )}

        {tab === "perfil" && (
          <>
            <SectionHeading eyebrow="PERFIL" title="Perfil nutricional" />
            {user && <ProfileEditor user={user} allergens={allergens} onSaved={setUser} />}
          </>
        )}

        {tab === "menu" && (
          <>
            <SectionHeading eyebrow="MENÚ" title="Diseñador de menús" />
            <MenuBuilder
              userId={demoUserId}
              caloricGoal={user?.caloricGoal}
              dietType={user?.medicalRestrictions?.dietType}
            />
          </>
        )}
      </section>
    </main>
  );
}

export default App;
