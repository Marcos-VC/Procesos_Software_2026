import type { ReactNode, SVGProps } from "react";

// Iconos SVG en línea con el mismo estilo (rejilla de 24 px, trazo de 2 px, color heredado con
// currentColor). Son decorativos: llevan aria-hidden y el nombre accesible lo da el texto o el
// aria-label del control que los contiene.
export type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

function Icon({ children, className = "size-5", ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

/** Catálogo: rejilla de cuatro tarjetas. */
export const GridIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
);

/** Perfil: silueta de persona. */
export const UserIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5v-.5a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v.5" />
  </Icon>
);

/** Menú semanal: calendario. */
export const CalendarIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
);

/** Despensa: caja de almacenaje. */
export const BoxIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="5" rx="1.5" />
    <path d="M5 9v9.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4" />
  </Icon>
);

/** Lista de la compra: bolsa. */
export const BagIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5.5 8h13l-1 11.5a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 0 1-1.5-1.5L5.5 8Z" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" />
  </Icon>
);

/** Genérico (p. ej. una pestaña sin icono propio). */
export const DotIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3.5" />
  </Icon>
);

/** Desayuno: sol saliendo por el horizonte. */
export const SunriseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 19h18M7.5 19a4.5 4.5 0 0 1 9 0M12 5.5v3.5M5.6 10.6l1.8 1.8M18.4 10.6l-1.8 1.8" />
  </Icon>
);

/** Comida: tenedor y cuchillo. */
export const UtensilsIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 3v5a2 2 0 0 0 4 0V3M8 3v18" />
    <path d="M17 21V3c-2.2 1.2-3.5 3.8-3.5 7.5V14H17" />
  </Icon>
);

/** Cena: luna creciente. */
export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10.7 4A8.5 8.5 0 1 0 20 13.3 7 7 0 0 1 10.7 4Z" />
  </Icon>
);

/** Aviso (alérgenos, alimentos bloqueados). */
export const WarningIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10.3 4.3 2.7 17.5a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17h.01" />
  </Icon>
);

/** Información. */
export const InfoIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Icon>
);

/** Error (mensaje de estado). */
export const AlertIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16h.01" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const MinusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12h14" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

/** Menú favorito. */
export const StarIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3.6 14.4 9.4 20.6 9.8 15.8 13.8 17.3 19.9 12 16.6 6.7 19.9 8.2 13.8 3.4 9.8 9.6 9.4Z" />
  </Icon>
);
