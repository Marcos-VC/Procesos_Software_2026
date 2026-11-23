import type { ShoppingItem } from "../types";

// Compartir la lista de la compra (HU 5.3): se copia el texto al portapapeles y se abre WhatsApp o el
// correo para que el usuario lo pegue donde quiera. La app no envía nada ni llama a servicios externos.

export const SHARE_TITLE = "Lista de la compra (Healthy Life)";

/** Abre WhatsApp (la app o WhatsApp Web) sin texto: el usuario elige el chat y pega la lista. */
export const WHATSAPP_URL = "https://wa.me/";

/** Abre un correo nuevo solo con el asunto; la lista se pega en el cuerpo. */
export const EMAIL_URL = `mailto:?subject=${encodeURIComponent("Lista de la compra")}`;

/** Productos que quedan por comprar (sin marcar), del menú o añadidos a mano, en el orden recibido. */
export function pendingShoppingItems(items: ShoppingItem[]): ShoppingItem[] {
  return items.filter((item) => !item.checked);
}

// "(xN)" solo cuando un alimento se repite en el menú semanal.
function itemLine(item: ShoppingItem): string {
  const quantity = item.source === "menu" && item.count > 1 ? ` (x${item.count})` : "";
  return `- ${item.name}${quantity}`;
}

/**
 * Texto plano que se copia: el título, una línea en blanco y un producto pendiente por línea.
 * Mantiene el orden de la lista (por nombre); los productos ya marcados como comprados no se incluyen.
 */
export function buildShoppingListText(items: ShoppingItem[]): string {
  return [SHARE_TITLE, "", ...pendingShoppingItems(items).map(itemLine)].join("\n");
}

// Alternativa para cuando no hay API del portapapeles: `navigator.clipboard` solo existe en contextos
// seguros (https o localhost), y desde el móvil la app se suele abrir por http con la IP del equipo.
// Copia la selección de un <textarea> temporal; tiene que ejecutarse durante el clic del usuario.
function copyWithTextarea(text: string): boolean {
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", ""); // en el móvil no abre el teclado
  textarea.setAttribute("aria-hidden", "true");
  // Fijo y transparente para que no mueva la página; 16 px para que iOS no haga zoom.
  textarea.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;";
  document.body.appendChild(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();
  textarea.setSelectionRange(0, text.length); // iOS no siempre respeta select()
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  previousFocus?.focus({ preventScroll: true });
  return copied;
}

/**
 * Copia el texto al portapapeles y resuelve `true` si lo consigue. Hay que llamarla directamente desde
 * el clic y sin esperar al resultado antes de abrir la app: los navegadores solo dejan copiar (y abrir
 * pestañas) como respuesta inmediata a una acción del usuario.
 */
export function copyShoppingListText(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => copyWithTextarea(text),
    );
  }
  return Promise.resolve(copyWithTextarea(text));
}
