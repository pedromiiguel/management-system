import { queryOptions, useMutation } from '@tanstack/react-query';
import type { ProductInput, UpdateProductInput } from '@beverage/shared';
import { http, type Paginated } from '@/lib/http';
import { rootKeys, useInvalidate } from '@/lib/query-keys';

/** Produto como a API devolve; as demais telas usam recortes (`Pick`) dele. */
export interface Product {
  id: string;
  sku: string;
  ean: string | null;
  name: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minimumStock: number;
  active: boolean;
}

export const CATALOG_PAGE_SIZE = 50;

export const productKeys = {
  catalog: (search: string, page: number) =>
    [...rootKeys.products, 'catalog', search, page] as const,
  search: (term: string, limit: number) => [...rootKeys.products, 'search', term, limit] as const,
};

/** Listagem do cadastro: paginada, ativos e inativos. */
export const catalogQuery = (search: string, page: number) =>
  queryOptions({
    queryKey: productKeys.catalog(search, page),
    queryFn: () =>
      http.get<Paginated<Product>>('/products', {
        search: search || undefined,
        page,
        perPage: CATALOG_PAGE_SIZE,
        all: 'true',
      }),
  });

/** Busca rápida de produtos ativos (PDV, Entrada, Ajuste). Só dispara com 2+ caracteres. */
export const productSearchQuery = (term: string, limit: number) =>
  queryOptions({
    queryKey: productKeys.search(term, limit),
    queryFn: () => http.get<Paginated<Product>>('/products', { search: term, perPage: limit }),
    enabled: term.length >= 2,
    select: (page) => page.items,
  });

// A Entrada embutida no formulário mexe no saldo; relatórios mostram posição de estoque.
const PRODUCT_EFFECTS = ['products', 'stock', 'reports'] as const;

export function useSaveProduct() {
  const onSuccess = useInvalidate(...PRODUCT_EFFECTS);
  return useMutation({
    mutationFn: (args: { id: string; input: UpdateProductInput } | { input: ProductInput }) =>
      'id' in args
        ? http.patch<Product>(`/products/${args.id}`, args.input)
        : http.post<Product>('/products', args.input),
    onSuccess,
  });
}

export function useDeactivateProduct() {
  const onSuccess = useInvalidate(...PRODUCT_EFFECTS);
  return useMutation({
    mutationFn: (id: string) => http.patch<Product>(`/products/${id}/deactivate`),
    onSuccess,
  });
}

/** Excluir: apaga o cadastro (a API recusa produto com venda registrada). */
export function useDeleteProduct() {
  const onSuccess = useInvalidate(...PRODUCT_EFFECTS);
  return useMutation({
    mutationFn: (id: string) => http.delete<{ deleted: boolean }>(`/products/${id}`),
    onSuccess,
  });
}
