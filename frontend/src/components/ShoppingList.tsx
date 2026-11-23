import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { api } from "../api";
import type { ShoppingItem } from "../types";
import {
  buildShoppingListText,
  copyShoppingListText,
  EMAIL_URL,
  pendingShoppingItems,
  WHATSAPP_URL,
} from "../utils/shareShoppingList";

interface ShoppingListProps {
  userId: string;
}

// Mismo límite que el backend para los productos añadidos a mano (HU 5.4).
const MAX_MANUAL_NAME_LENGTH = 60;

// Mismo orden que devuelve el backend: por nombre.
const byName = (a: ShoppingItem, b: ShoppingItem) => a.name.localeCompare(b.name, "es");

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

// Frase resumen sobre la lista: alimentos del menú y productos añadidos a mano (HU 5.4).
function summaryText(items: ShoppingItem[]) {
  const menuCount = items.filter((item) => item.source === "menu").length;
  const manualCount = items.length - menuCount;
  const manualText = plural(manualCount, "producto añadido a mano", "productos añadidos a mano");

  if (items.length === 0) {
    return "El menú semanal está vacío. Añade alimentos al menú o productos a mano para generar la lista.";
  }
  if (menuCount === 0) {
    return `El menú semanal está vacío; ${manualText}.`;
  }
  const menuText = `${plural(menuCount, "alimento necesario", "alimentos necesarios")} para la semana`;
  return manualCount > 0 ? `${menuText} y ${manualText}.` : `${menuText}.`;
}

function shareHint(pendingCount: number) {
  if (pendingCount === 0) return "No hay productos pendientes que compartir";
  if (pendingCount === 1) return "Se copia 1 producto pendiente";
  return `Se copian los ${pendingCount} productos pendientes`;
}

// Iconos de línea (24×24); son decorativos (aria-hidden) y toman el color del texto.
function Icon({ children, className = "size-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// Portapapeles: la lista se copia para pegarla después.
const CopyIcon = () => (
  <Icon>
    <rect width="8" height="4" x="8" y="2" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6M9 16h4" />
  </Icon>
);

// Bocadillo de chat, para WhatsApp.
const ChatIcon = () => (
  <Icon>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </Icon>
);

const MailIcon = () => (
  <Icon>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);

const CheckIcon = () => (
  <Icon className="size-4">
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

// Mismo alto (44 px) y borde en todos los controles, para que no "salten" al activarse o desactivarse.
const shareControlBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold whitespace-nowrap transition duration-200";
const shareLinkBase = `${shareControlBase} cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`;
const shareDisabledClass = `${shareControlBase} cursor-not-allowed border-line bg-surface text-muted`;

const shareChannels = [
  {
    key: "whatsapp",
    name: "Copiar y abrir WhatsApp",
    icon: <ChatIcon />,
    href: WHATSAPP_URL,
    newTab: true,
    copiedMessage: "Lista copiada. Pégala en el chat de WhatsApp.",
    className: `${shareLinkBase} border-transparent bg-whatsapp text-white shadow-md shadow-whatsapp/25 hover:bg-whatsapp-dark hover:shadow-lg`,
  },
  {
    key: "email",
    name: "Copiar y abrir correo",
    icon: <MailIcon />,
    href: EMAIL_URL,
    newTab: false,
    copiedMessage: "Lista copiada. Pégala en el correo.",
    className: `${shareLinkBase} border-line bg-white text-secondary hover:border-primary hover:bg-primary-soft hover:text-primary-dark`,
  },
] as const;

type ShareChannel = (typeof shareChannels)[number]["key"];

// Tiempo que se ve el aviso de "Lista copiada".
const COPIED_FEEDBACK_MS = 4000;

interface CopyResult {
  channel: ShareChannel;
  copied: boolean;
}

// Compartir los productos pendientes (HU 5.3): cada botón copia la lista al portapapeles y abre
// WhatsApp o el correo para que el usuario la pegue. El texto se calcula a partir de `items`, así que
// siempre es el de ese momento. Sin productos pendientes los controles se muestran desactivados
// (como botones, porque un enlace no se puede desactivar).
function ShareShoppingList({ items }: { items: ShoppingItem[] }) {
  const titleId = useId();
  const hintId = useId();
  const [result, setResult] = useState<CopyResult | null>(null);
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);
  const pendingCount = pendingShoppingItems(items).length;
  const text = buildShoppingListText(items);
  const copyFailed = result !== null && !result.copied && pendingCount > 0;

  // El aviso de "copiada" se oculta solo; el de error se queda hasta el siguiente intento.
  useEffect(() => {
    if (!result?.copied) return;
    const timer = window.setTimeout(() => setResult(null), COPIED_FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [result]);

  // Si no se pudo copiar, se enfoca (y selecciona) el texto para copiarlo a mano.
  useEffect(() => {
    if (copyFailed) manualCopyRef.current?.focus();
  }, [copyFailed, result]);

  // Se copia dentro del propio clic, sin esperar al resultado: así el enlace abre la app a la vez y
  // ningún navegador lo bloquea. Cuando termina la copia se muestra el aviso.
  const copyAndOpen = (channel: ShareChannel) => {
    void copyShoppingListText(text).then((copied) => setResult({ channel, copied }));
  };

  const copiedMessage =
    result?.copied ? shareChannels.find((channel) => channel.key === result.channel)?.copiedMessage : "";

  return (
    <section aria-labelledby={titleId} className="card p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-dark">
            <CopyIcon />
          </span>
          <div className="grid gap-0.5">
            <h3 id={titleId} className="text-lg font-semibold text-secondary">
              Compartir lista
            </h3>
            <p id={hintId} className="text-sm text-muted">
              {shareHint(pendingCount)}
            </p>
          </div>
        </div>
        {/* Móvil: uno debajo de otro a todo el ancho; desde sm, uno al lado del otro. */}
        <div className="grid gap-2 sm:grid-cols-2">
          {shareChannels.map(({ key, name, icon, href, newTab, className }) =>
            pendingCount > 0 ? (
              <a
                key={key}
                className={className}
                href={href}
                target={newTab ? "_blank" : undefined}
                rel={newTab ? "noopener noreferrer" : undefined}
                aria-describedby={hintId}
                onClick={() => copyAndOpen(key)}
              >
                {icon}
                {name}
              </a>
            ) : (
              <button key={key} type="button" className={shareDisabledClass} disabled aria-describedby={hintId}>
                {icon}
                {name}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Región "polite" siempre presente (vacía si no hay aviso) para que los lectores de pantalla lo anuncien. */}
      <p
        role="status"
        className={
          copiedMessage
            ? "mt-4 flex items-center gap-2 rounded-xl bg-ok-soft px-4 py-3 text-sm font-semibold text-ok"
            : ""
        }
      >
        {copiedMessage && (
          <>
            <CheckIcon />
            {copiedMessage}
          </>
        )}
      </p>

      {copyFailed && (
        <div className="mt-4 grid gap-2">
          <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-dark" role="alert">
            No se ha podido copiar la lista automáticamente. Selecciona el texto de abajo y cópialo a mano.
          </p>
          <textarea
            ref={manualCopyRef}
            className="input resize-y text-sm leading-6"
            aria-label="Texto de la lista para copiar"
            readOnly
            // Título, línea en blanco y un producto por línea, con una de margen por si alguna se parte.
            rows={Math.min(pendingCount + 3, 12)}
            value={text}
            onFocus={(event) => {
              event.currentTarget.select();
              event.currentTarget.setSelectionRange(0, event.currentTarget.value.length);
            }}
          />
        </div>
      )}
    </section>
  );
}

function ShoppingList({ userId }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[] | null>(null);
  const [error, setError] = useState("");
  // Error al guardar una marca (HU 5.2) o al eliminar un producto (HU 5.4): se muestra sin ocultar la lista.
  const [saveError, setSaveError] = useState("");
  // Formulario para añadir productos a mano (HU 5.4).
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setItems(null);
    setError("");
    setSaveError("");
    setAddError("");
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

  // Añade un producto que no sale del menú (HU 5.4); si el backend lo rechaza se muestra su mensaje.
  const addManualItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name || adding) return;
    setAdding(true);
    setAddError("");
    try {
      const item = await api.addManualShoppingItem(userId, name);
      setItems((current) => (current ? [...current, item].sort(byName) : current));
      setNewName("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "No se pudo añadir el producto");
    } finally {
      setAdding(false);
      inputRef.current?.focus();
    }
  };

  // Borrado optimista (HU 5.4): se quita al momento y se vuelve a mostrar si el backend falla.
  const removeManualItem = (item: ShoppingItem) => {
    setSaveError("");
    setItems((current) => current?.filter((entry) => entry.id !== item.id) ?? null);
    api.deleteManualShoppingItem(userId, item.id).catch((err: unknown) => {
      setItems((current) => (current ? [...current, item].sort(byName) : current));
      setSaveError(err instanceof Error ? err.message : "No se pudo eliminar el producto");
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
  const allBought = items.length > 0 && checkedCount === items.length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <p className="text-sm text-muted">{summaryText(items)}</p>
            {items.length > 0 && (
              <p
                className={`text-sm font-semibold ${allBought ? "text-ok" : "text-secondary"}`}
                role="status"
              >
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
        {/* Barra de progreso de la compra: se pone verde al tenerlo todo. */}
        {items.length > 0 && (
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label="Progreso de la compra"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={checkedCount}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${allBought ? "bg-ok" : "bg-primary"}`}
              style={{ width: `${(checkedCount / items.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      <form className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end" onSubmit={addManualItem}>
        <label className="grid flex-1 gap-1 text-sm font-medium">
          Añadir producto a la lista
          <input
            ref={inputRef}
            className="input"
            value={newName}
            maxLength={MAX_MANUAL_NAME_LENGTH}
            placeholder="Ej.: papel de cocina"
            onChange={(event) => {
              setNewName(event.target.value);
              setAddError("");
            }}
          />
        </label>
        <button
          type="submit"
          className="btn gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          disabled={!newName.trim() || adding}
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          Añadir
        </button>
      </form>

      {addError && (
        <p className="rounded-xl bg-primary-soft px-4 py-3 text-primary-dark" role="alert">
          {addError}
        </p>
      )}

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
              className={`card flex items-center gap-3 py-1 pr-3 pl-1 transition duration-200 ${
                item.checked ? "bg-surface shadow-none" : ""
              }`}
            >
              {/* Toda la fila (no solo la casilla) marca el producto: área táctil amplia en móvil. */}
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-4 py-3">
                <input
                  type="checkbox"
                  className="size-5 shrink-0 cursor-pointer accent-primary"
                  checked={item.checked}
                  onChange={(event) => toggle(item.id, event.target.checked)}
                />
                <span
                  className={`min-w-0 break-words font-medium ${
                    item.checked ? "text-muted line-through" : "text-secondary"
                  }`}
                >
                  {item.name}
                </span>
              </label>
              <span className="flex shrink-0 items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                    item.checked
                      ? "bg-line text-muted"
                      : item.source === "manual"
                        ? "bg-white text-secondary ring-1 ring-line"
                        : "bg-primary-soft text-primary-dark"
                  }`}
                >
                  {item.source === "manual" ? (
                    <>
                      <span aria-hidden="true">✎</span>
                      {/* En móvil, versión corta para no partir el nombre en dos líneas. */}
                      <span className="sm:hidden">A mano</span>
                      <span className="hidden sm:inline">Añadido a mano</span>
                    </>
                  ) : (
                    `${item.count} ${item.count === 1 ? "vez" : "veces"}`
                  )}
                </span>
                {item.source === "manual" && (
                  <button
                    type="button"
                    className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label={`Eliminar ${item.name}`}
                    title={`Eliminar ${item.name}`}
                    onClick={() => removeManualItem(item)}
                  >
                    {/* Icono de papelera */}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-[18px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <ShareShoppingList items={items} />
    </div>
  );
}

export default ShoppingList;
