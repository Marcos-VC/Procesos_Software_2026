import { useEffect, useState } from "react";
import { api } from "../api";
import type { ShoppingItem } from "../types";

interface ShoppingListProps {
  userId: string;
}

function ShoppingList({ userId }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[] | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setItems(null);
    setError("");
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {items.length === 0
            ? "El menú semanal está vacío. Añade alimentos al menú para generar la lista."
            : `${items.length} ${items.length === 1 ? "alimento" : "alimentos"} necesarios para la semana.`}
        </p>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-line px-4 py-2 text-sm font-semibold text-primary-dark transition duration-200 hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={load}
        >
          <span aria-hidden="true">↻</span>
          Actualizar
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          <p className="text-4xl mb-3" aria-hidden="true">🛒</p>
          <p>No hay alimentos en el menú semanal.</p>
        </div>
      ) : (
        <ul className="grid gap-2" aria-label="Lista de la compra">
          {items.map((item) => (
            <li
              key={item.foodId}
              className="card flex items-center justify-between gap-4 px-5 py-4"
            >
              <span className="font-medium text-secondary">{item.name}</span>
              <span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
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
