import { useState, type FormEvent } from "react";
import { api } from "../api";
import type { Allergen, DietType, UserProfile } from "../types";
import AllergySelector from "./AllergySelector";
import DietPreferenceSelector from "./DietPreferenceSelector";

// Edición del perfil nutricional: objetivo calórico diario y alergias (HU 2.2). Guarda en el backend con PUT.
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
  const [caloricGoal, setCaloricGoal] = useState(String(user.caloricGoal));
  const [allergies, setAllergies] = useState(user.medicalRestrictions.allergies);
  const [dietType, setDietType] = useState<DietType | string>(
    user.medicalRestrictions.dietType || "omnivore",
  );
  const [status, setStatus] = useState<Status | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    try {
      await api.updateProfile(user.userId, { caloricGoal: Number(caloricGoal) });
      const updated = await api.updateAllergies(user.userId, allergies);
      const withDiet = await api.updateDietType(updated.userId, dietType);
      onSaved(withDiet);
      setStatus({ type: "ok", text: "Perfil guardado correctamente" });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar el perfil",
      });
    }
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="card relative grid gap-2 overflow-hidden p-6 sm:p-8">
        <span className="absolute inset-y-0 left-0 w-1.5 bg-primary" aria-hidden="true" />
        <label className="grid max-w-xs gap-2 text-sm font-medium text-secondary">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <AllergySelector
            allergenCatalog={allergens}
            selected={allergies}
            onChange={setAllergies}
          />
        </div>
        <div className="card p-6 sm:p-8">
          <DietPreferenceSelector selected={dietType} onChange={setDietType} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
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
      </div>
    </form>
  );
}

export default ProfileEditor;
