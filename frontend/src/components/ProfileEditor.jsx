import { useState } from "react";
import { api } from "../api.js";

// Edición del perfil nutricional: objetivo calórico y alergias/intolerancias
// (listado desplegable con casillas). Guarda en el backend con PUT.
function ProfileEditor({ user, allergens, onSaved }) {
  const [selected, setSelected] = useState(user.medicalRestrictions.allergies);
  const [caloricGoal, setCaloricGoal] = useState(String(user.caloricGoal));
  const [status, setStatus] = useState(null);

  const toggleAllergen = (allergenId) => {
    setSelected((current) =>
      current.includes(allergenId)
        ? current.filter((item) => item !== allergenId)
        : [...current, allergenId],
    );
  };

  const handleSubmit = async (event) => {
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
      setStatus({ type: "error", text: error.message });
    }
  };

  return (
    <form className="grid max-w-lg justify-items-start gap-5" onSubmit={handleSubmit}>
      <label className="grid w-full gap-2 text-sm text-muted">
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

      <details className="w-full border border-outline bg-white/45">
        <summary className="cursor-pointer px-3.5 py-3">
          Alergias e intolerancias ({selected.length} seleccionadas)
        </summary>
        <ul className="grid grid-cols-2 gap-2.5 px-3.5 pt-1.5 pb-4">
          {allergens.map((allergen) => (
            <li key={allergen.id}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 accent-ink"
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
          className={status.type === "ok" ? "font-bold text-ok" : "text-danger"}
          role={status.type === "ok" ? "status" : "alert"}
        >
          {status.text}
        </p>
      )}
    </form>
  );
}

export default ProfileEditor;
