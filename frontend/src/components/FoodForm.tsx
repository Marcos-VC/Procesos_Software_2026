import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import type { Allergen, Food, NewFood } from "../types";

interface FoodFormProps {
  allergens: Allergen[];
  onCreated: (food: Food) => void;
}

const initialForm: NewFood = {
  name: "",
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fat: 0,
  allergens: [],
};

function FoodForm({ allergens, onCreated }: FoodFormProps) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!status || status.startsWith("No se pudo")) return;
    const timeout = window.setTimeout(() => setStatus(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const updateNumber = (field: "calories" | "protein" | "carbohydrates" | "fat", value: string) => {
    setForm((current) => ({ ...current, [field]: Number(value) }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    try {
      const food = await api.addFood(form);
      onCreated(food);
      setForm(initialForm);
      setStatus("Alimento añadido correctamente");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo añadir el alimento");
    }
  };

  return (
    <details className="card mb-8 p-5">
      <summary className="cursor-pointer font-semibold text-secondary">Añadir alimento</summary>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <label className="grid gap-1 text-sm font-medium sm:col-span-2">
          Nombre
          <input
            required
            className="input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        {([
          ["calories", "Calorías"],
          ["protein", "Proteínas"],
          ["carbohydrates", "Carbohidratos"],
          ["fat", "Grasas"],
        ] as const).map(([field, label]) => (
          <label key={field} className="grid gap-1 text-sm font-medium">
            {label} por 100 g
            <input
              required
              min="0"
              step="0.1"
              type="number"
              className="input"
              value={form[field]}
              onChange={(event) => updateNumber(field, event.target.value)}
            />
          </label>
        ))}
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="text-sm font-medium">Alérgenos</legend>
          <div className="flex flex-wrap gap-3">
            {allergens.map((allergen) => (
              <label key={allergen.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.allergens.includes(allergen.id)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      allergens: event.target.checked
                        ? [...current.allergens, allergen.id]
                        : current.allergens.filter((id) => id !== allergen.id),
                    }))
                  }
                />
                {allergen.name}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn sm:col-span-2">Guardar alimento</button>
        {status && (
          <p
            role="status"
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium sm:col-span-2 ${
              status === "Alimento añadido correctamente"
                ? "border border-ok/25 bg-ok-soft text-ok"
                : "border border-primary/20 bg-primary-soft text-primary-dark"
            }`}
          >
            <span aria-hidden="true">{status === "Alimento añadido correctamente" ? "✓" : "!"}</span>
            <span>{status}</span>
          </p>
        )}
      </form>
    </details>
  );
}

export default FoodForm;
