import { queryOptions, useMutation } from '@tanstack/react-query';
import { rootKeys, useInvalidate } from '@main/query/query-keys';
import type { TSaveProductParams } from '../domain/product-model';
import { makeProductsGateway } from './products-factory';

export const CATALOG_PAGE_SIZE = 50;
const MIN_SEARCH_LENGTH = 2;

const productKeys = {
  catalog: (search: string, page: number) =>
    [...rootKeys.products, 'catalog', search, page] as const,
  search: (term: string, limit: number) => [...rootKeys.products, 'search', term, limit] as const,
};

/** Listagem do cadastro: paginada, ativos e inativos. */
export const catalogQuery = (search: string, page: number) =>
  queryOptions({
    queryKey: productKeys.catalog(search, page),
    queryFn: () =>
      makeProductsGateway().search({
        search,
        page,
        perPage: CATALOG_PAGE_SIZE,
        includeInactive: true,
      }),
  });

/** Busca rápida de produtos ativos (PDV, Entrada, Ajuste). Só dispara com 2+ caracteres. */
export const productSearchQuery = (term: string, limit: number) =>
  queryOptions({
    queryKey: productKeys.search(term, limit),
    queryFn: () => makeProductsGateway().search({ search: term, perPage: limit }),
    enabled: term.length >= MIN_SEARCH_LENGTH,
    select: (page) => page.items,
  });

// A Entrada embutida no formulário mexe no saldo; relatórios mostram posição de estoque.
const PRODUCT_EFFECTS = ['products', 'stock', 'reports'] as const;

export function useSaveProduct() {
  const onSuccess = useInvalidate(...PRODUCT_EFFECTS);
  return useMutation({
    mutationFn: (params: TSaveProductParams) => makeProductsGateway().save(params),
    onSuccess,
  });
}

export function useDeactivateProduct() {
  const onSuccess = useInvalidate(...PRODUCT_EFFECTS);
  return useMutation({
    mutationFn: (id: string) => makeProductsGateway().deactivate(id),
    onSuccess,
  });
}

export function useDeleteProduct() {
  const onSuccess = useInvalidate(...PRODUCT_EFFECTS);
  return useMutation({
    mutationFn: (id: string) => makeProductsGateway().delete(id),
    onSuccess,
  });
}
