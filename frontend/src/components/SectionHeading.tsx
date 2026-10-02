import type { ReactNode } from "react";

// Cabecera de sección: etiqueta, título y, opcionalmente, una acción a la derecha.
interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

function SectionHeading({ eyebrow, title, children }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3.5 text-xs font-bold tracking-widest text-accent">
          {eyebrow}
        </p>
        <h2 className="text-4xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default SectionHeading;
