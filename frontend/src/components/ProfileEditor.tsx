import { useState, type FormEvent } from "react";
import { api } from "../api";
import type { UserProfile } from "../types";

// Edición del perfil nutricional: objetivo calórico diario. Guarda en el backend con PUT.
interface ProfileEditorProps {
  user: UserProfile;
  onSaved: (user: UserProfile) => void;
}

interface Status {
  type: "ok" | "error";
  text: string;
}

function ProfileEditor({ user, onSaved }: ProfileEditorProps) {
  const [caloricGoal, setCaloricGoal] = useState(String(user.caloricGoal));
  const [status, setStatus] = useState<Status | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    try {
      const updated = await api.updateProfile(user.userId, {
        caloricGoal: Number(caloricGoal),
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
