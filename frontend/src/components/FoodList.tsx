import type { Allergen, CatalogFood } from "../types";
import FoodItem from "./FoodItem";

// Lista de alimentos del catálogo. `foods === null` significa "cargando".
interface FoodListProps {
  /** `null` mientras se cargan. */
  foods: CatalogFood[] | null;
  allergenCatalog?: Record<string, Allergen | undefined>;
}

function FoodList({ foods, allergenCatalog = {} }: FoodListProps) {
  if (foods === null) {
    return <p className="text-muted">Cargando alimentos...</p>;
  }

  if (foods.length === 0) {
    return <p className="text-muted">No se encontraron alimentos</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {foods.map((food) => (
        <FoodItem key={food.id} food={food} allergenCatalog={allergenCatalog} />
      ))}
    </div>
  );
}

export default FoodList;
