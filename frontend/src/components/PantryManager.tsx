import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import { PANTRY_UNITS, type PantryItem, type PantryUnit } from "../types";
import { TrashIcon } from "./icons";

interface PantryManagerProps {
  userId: string;
}

interface Status {
  type: "ok" | "error";
  text: string;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

function PantryManager({ userId }: PantryManagerProps) {
  const [items, setItems] = useState<PantryItem[] | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<PantryUnit>("unidades");
  const [draftQuantities, setDraftQuantities] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    api
      .getPantry(userId)
      .then((data) => {
        setItems(data);
        setDraftQuantities(
          Object.fromEntries(data.map((item) => [item.id, String(item.quantity)])),
        );
      })
      .catch((error: unknown) =>
        setStatus({ type: "error", text: errorMessage(error) }),
      );
  }, [userId]);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      const saved = await api.addPantryItem(userId, {
        name: name.trim(),
        quantity: Number(quantity),
        unit,
      });
      setItems((current) => {
        const list = current ?? [];
        const exists = list.some((item) => item.id === saved.id);
        return exists
          ? list.map((item) => (item.id === saved.id ? saved : item))
          : [...list, saved];
      });
      setDraftQuantities((current) => ({
        ...current,
        [saved.id]: String(saved.quantity),
      }));
      setName("");
      setQuantity("1");
      setUnit("unidades");
      setStatus({ type: "ok", text: `Producto "${saved.name}" añadido a la despensa` });
    } catch (error) {
      setStatus({ type: "error", text: errorMessage(error) });
    }
  };

  const handleConfirmQuantity = async (item: PantryItem) => {
    setStatus(null);
    const rawValue = draftQuantities[item.id] ?? String(item.quantity);
    const nextQuantity = Number(rawValue);

    if (Number.isFinite(nextQuantity) && nextQuantity === 0) {
      await handleDelete(item);
      return;
    }

    try {
      const updated = await api.updatePantryItem(userId, item.id, {
        quantity: nextQuantity,
      });
      setItems((current) =>
        (current ?? []).map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      setDraftQuantities((current) => ({
        ...current,
        [updated.id]: String(updated.quantity),
      }));
      setStatus({
        type: "ok",
        text: `Existencias de "${updated.name}" actualizadas (${updated.quantity} ${updated.unit})`,
      });
    } catch (error) {
      setStatus({ type: "error", text: errorMessage(error) });
    }
  };

  const handleDelete = async (item: PantryItem) => {
    setStatus(null);
    try {
      await api.deletePantryItem(userId, item.id);
      setItems((current) => (current ?? []).filter((entry) => entry.id !== item.id));
      setDraftQuantities((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setStatus({ type: "ok", text: `Producto "${item.name}" eliminado de la despensa` });
    } catch (error) {
      setStatus({ type: "error", text: errorMessage(error) });
    }
  };

  if (items === null) {
    return status ? (
      <p className="rounded-xl bg-primary-soft px-4 py-3 text-primary-dark" role="alert">
        {status.text}
      </p>
    ) : (
      <p className="card p-8 text-center text-muted">Cargando despensa...</p>
    );
  }

  return (
    <div className="grid gap-6">
      <form
        className="card relative grid gap-4 overflow-hidden p-6 sm:grid-cols-12 sm:items-end"
        onSubmit={handleAdd}
        aria-label="Añadir producto a la despensa"
      >
        <span className="absolute inset-y-0 left-0 w-1.5 bg-primary" aria-hidden="true" />
        <label className="grid gap-1.5 text-sm font-medium text-secondary sm:col-span-5">
          <span>Nombre del ingrediente</span>
          <input
            required
            className="input"
            placeholder="Ej. Arroz integral, Leche, Huevos..."
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-secondary sm:col-span-3">
          <span>Cantidad</span>
          <input
            required
            type="number"
            min="0.1"
            step="any"
            className="input"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-secondary sm:col-span-2">
          <span>Unidad</span>
          <select
            className="input cursor-pointer"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          >
            {PANTRY_UNITS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2">
          <button type="submit" className="btn w-full">
            Añadir
          </button>
        </div>
      </form>

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

      <div className="card p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">
              Inventario en casa
            </p>
            <h3 className="text-2xl font-bold text-secondary">Listado de existencias</h3>
          </div>
          <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary-dark">
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </span>
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted">
            No tienes productos en tu despensa virtual.
          </p>
        ) : (
          <ul className="grid gap-3" aria-label="Listado de existencias">
            {items.map((item) => {
              const currentDraft = draftQuantities[item.id] ?? String(item.quantity);
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/60 px-3 py-3.5 sm:gap-4 sm:px-4 transition hover:border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-bold text-secondary">
                      {item.name}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-line">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-muted">
                      <span className="sr-only">Cantidad de {item.name}</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        aria-label={`Cantidad de ${item.name}`}
                        className="input w-20 py-1.5 text-sm sm:w-24"
                        value={currentDraft}
                        onChange={(event) =>
                          setDraftQuantities((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                      <span className="hidden text-xs font-medium text-muted sm:inline">{item.unit}</span>
                    </label>

                    <button
                      type="button"
                      className="cursor-pointer rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-semibold text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                      aria-label={`Confirmar modificación de ${item.name}`}
                      onClick={() => void handleConfirmQuantity(item)}
                    >
                      Confirmar
                    </button>

                    {/* Papelera, como en la lista de la compra: la fila cabe en una línea en el móvil. */}
                    <button
                      type="button"
                      className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      aria-label={`Eliminar ${item.name}`}
                      title={`Eliminar ${item.name}`}
                      onClick={() => void handleDelete(item)}
                    >
                      <TrashIcon className="size-[18px]" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PantryManager;

