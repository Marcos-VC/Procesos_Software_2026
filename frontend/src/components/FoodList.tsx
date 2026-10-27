import type { Allergen, DietType, Food } from "../types";
import FoodItem from "./FoodItem";

// Lista de alimentos del catálogo. `foods === null` significa "cargando".
interface FoodListProps {
  /** `null` mientras se cargan. */
  foods: Food[] | null;
  allergenCatalog?: Record<string, Allergen | undefined>;
  dietType?: DietType | string;
}

function FoodList({ foods, allergenCatalog = {}, dietType }: FoodListProps) {
  if (foods === null) {
    return <p className="card p-8 text-center text-muted">Cargando alimentos...</p>;
  }

  if (foods.length === 0) {
    return (
      <p className="card p-8 text-center text-muted">No se encontraron alimentos</p>
    );
  }

  const visibleFoods = foods.filter(
    (food) =>
      !food.suitableFor ||
      !dietType ||
      food.suitableFor.includes(dietType as DietType),
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {visibleFoods.map((food) => (
        <FoodItem
          key={food.id}
          food={food}
          allergenCatalog={allergenCatalog}
        />
      ))}
    </div>
  );
}

export default FoodList;
