import { useState, type FormEvent } from "react";
import { api } from "../api";
import type { Allergen, UserProfile } from "../types";

// Edición del perfil nutricional: objetivo calórico y alergias/intolerancias
// (listado desplegable con casillas). Guarda en el backend con PUT.
interface ProfileEditorProps {
  user: UserProfile;
  allergens: Allergen[];
  onSaved: (user: UserProfile) => void;
}

interface Status {
  type: "ok" | "error";
  text: string;
}

function ProfileEditor({ user, allergens, onSaved }: ProfileEditorProps) {
  const [selected, setSelected] = useState(user.medicalRestrictions.allergies);
  const [caloricGoal, setCaloricGoal] = useState(String(user.caloricGoal));
  const [status, setStatus] = useState<Status | null>(null);

  const toggleAllergen = (allergenId: string) => {
    setSelected((current) =>
      current.includes(allergenId)
        ? current.filter((item) => item !== allergenId)
        : [...current, allergenId],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    try {
      const updated = await api.updateProfile(user.userId, {
        caloricGoal: Number(caloricGoal),
        medicalRestrictions: { allergies: selected },
      });
      onSaved(updated);
      setStatus({ type: "ok", text: "Perfil guardado correctamente" });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar el perfil",
      });
    }
  };

  return (
    <form
      className="card grid max-w-xl justify-items-start gap-6 p-6 sm:p-8"
      onSubmit={handleSubmit}
    >
      <label className="grid w-full gap-2 text-sm font-medium text-secondary">
        <span>Objetivo calórico diario (kcal)</span>
        <input
          className="input"
          type="number"
          min="500"
          max="10000"
          value={caloricGoal}
          onChange={(event) => setCaloricGoal(event.target.value)}
        />
      </label>

      <details className="w-full rounded-xl border border-line bg-surface/60 transition open:bg-white open:shadow-md">
        <summary className="cursor-pointer rounded-xl px-4 py-3 font-medium select-none hover:bg-primary-soft">
          Alergias e intolerancias ({selected.length} seleccionadas)
        </summary>
        <ul className="grid grid-cols-1 gap-1 px-3 pt-1 pb-3 sm:grid-cols-2">
          {allergens.map((allergen) => (
            <li key={allergen.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-primary-soft">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={selected.includes(allergen.id)}
                  onChange={() => toggleAllergen(allergen.id)}
                />
                <span aria-hidden="true">{allergen.icon}</span> {allergen.name}
              </label>
            </li>
          ))}
        </ul>
      </details>

      <button type="submit" className="btn">
        Guardar cambios
      </button>
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
    </form>
  );
}

export default ProfileEditor;
