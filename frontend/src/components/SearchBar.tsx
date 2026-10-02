import { useState, type FormEvent } from "react";

// Buscador del catálogo: la búsqueda se lanza al pulsar "Buscar" (o Enter).
interface SearchBarProps {
  onSearch: (term: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [term, setTerm] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(term.trim());
  };

  return (
    <form
      className="flex w-full gap-2 md:w-auto"
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="flex-1">
        <span className="sr-only">Buscar alimento</span>
        <input
          className="input md:w-56"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar alimento"
        />
      </label>
      <button type="submit" className="btn">
        Buscar
      </button>
    </form>
  );
}

export default SearchBar;
