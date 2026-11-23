import { createFileRoute } from '@tanstack/react-router';
import { ProductsFlow } from '@modules/products/presentation/flows/products';

export const Route = createFileRoute('/_app/products')({
  component: ProductsFlow,
});
