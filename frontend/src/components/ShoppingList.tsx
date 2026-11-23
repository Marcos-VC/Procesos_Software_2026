import { useEffect, useState } from "react";
import { api } from "../api";
import type { ShoppingItem } from "../types";

interface ShoppingListProps {
  userId: string;
}

function ShoppingList({ userId }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[] | null>(null);
  const [error, setError] = useState("");
  // Error al guardar una marca (HU 5.2): se muestra sin ocultar la lista.
  const [saveError, setSaveError] = useState("");

  const load = () => {
    setItems(null);
    setError("");
    setSaveError("");
    api
      .getShoppingList(userId)
      .then((data) => setItems(data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Error al cargar la lista"),
      );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const setChecked = (itemId: string, checked: boolean) =>
    setItems((current) =>
      current?.map((item) => (item.id === itemId ? { ...item, checked } : item)) ?? null,
    );

  // Actualización optimista: se tacha al momento y se deshace si el backend falla.
  const toggle = (itemId: string, checked: boolean) => {
    setSaveError("");
    setChecked(itemId, checked);
    api.setShoppingItemChecked(userId, itemId, checked).catch((err: unknown) => {
      setChecked(itemId, !checked);
      setSaveError(err instanceof Error ? err.message : "No se pudo guardar el cambio");
    });
  };

  if (error) {
    return (
      <p className="rounded-xl bg-primary-soft px-4 py-3 text-primary-dark" role="alert">
        {error}
      </p>
    );
  }

  if (!items) {
    return <p className="card p-8 text-center text-muted">Generando lista de la compra...</p>;
  }

  const checkedCount = items.filter((item) => item.checked).length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-sm text-muted">
            {items.length === 0
              ? "El menú semanal está vacío. Añade alimentos al menú para generar la lista."
              : `${items.length} ${items.length === 1 ? "alimento" : "alimentos"} necesarios para la semana.`}
          </p>
          {items.length > 0 && (
            <p className="text-sm font-semibold text-secondary" role="status">
              {checkedCount} de {items.length} comprados
            </p>
          )}
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-line px-4 py-2 text-sm font-semibold text-primary-dark transition duration-200 hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={load}
        >
          <span aria-hidden="true">↻</span>
          Actualizar
        </button>
      </div>

      {saveError && (
        <p className="rounded-xl bg-primary-soft px-4 py-3 text-primary-dark" role="alert">
          {saveError}
        </p>
      )}

      {items.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          <p className="text-4xl mb-3" aria-hidden="true">🛒</p>
          <p>No hay alimentos en el menú semanal.</p>
        </div>
      ) : (
        <ul className="grid gap-2" aria-label="Lista de la compra">
          {items.map((item) => (
            <li
              key={item.id}
              className={`card flex items-center justify-between gap-4 px-5 py-4 transition duration-200 ${
                item.checked ? "bg-surface shadow-none" : ""
              }`}
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="size-5 shrink-0 cursor-pointer accent-primary"
                  checked={item.checked}
                  onChange={(event) => toggle(item.id, event.target.checked)}
                />
                <span
                  className={
                    item.checked ? "font-medium text-muted line-through" : "font-medium text-secondary"
                  }
                >
                  {item.name}
                </span>
              </label>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  item.checked ? "bg-line text-muted" : "bg-primary-soft text-primary-dark"
                }`}
              >
                {item.count} {item.count === 1 ? "vez" : "veces"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShoppingList;
