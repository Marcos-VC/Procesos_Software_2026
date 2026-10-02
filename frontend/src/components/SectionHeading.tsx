import type { ReactNode } from "react";

// Cabecera de sección: etiqueta, título y, opcionalmente, una acción a la derecha.
interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

function SectionHeading({ eyebrow, title, children }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest text-primary">
          <span className="h-0.5 w-6 rounded-full bg-primary" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 className="text-3xl font-bold text-secondary sm:text-4xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default SectionHeading;
