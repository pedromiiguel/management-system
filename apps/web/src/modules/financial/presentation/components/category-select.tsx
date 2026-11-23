import type { UseFormRegisterReturn } from 'react-hook-form';
import type { IFinancialCategory } from '../../domain/financial-model';

type TCategorySelectProps = {
  categories: IFinancialCategory[];
  registration: UseFormRegisterReturn;
};

/** Categoria opcional ("—" = sem categoria). */
export function CategorySelect({ categories, registration }: TCategorySelectProps) {
  return (
    <select {...registration}>
      <option value="">—</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
