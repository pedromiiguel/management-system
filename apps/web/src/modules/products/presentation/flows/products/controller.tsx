import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Confirm } from '@presentation/components/Confirm';
import { todayKey } from '@presentation/utils/format';
import { toast } from '@presentation/utils/toast';
import { catalogQuery, useDeleteProduct } from '@modules/products/main/products-queries';
import { stockAlertsQuery } from '@modules/stock/main/stock-queries';
import type { IProduct } from '../../../domain/product-model';
import { DELETED_MESSAGE, deleteConfirmation } from './constants';
import { ProductsLayout } from './layout';
import type { TProductFilter, TProductsModal } from './types';
import { buildProductRows, countExpiringProducts } from './utils';

const NO_MODAL: TProductsModal = { kind: 'none' };

export function ProductsController() {
  const [searchState, setSearchState] = useState('');
  const [filterState, setFilterState] = useState<TProductFilter>('all');
  const [pageState, setPageState] = useState(1);
  const [modalState, setModalState] = useState<TProductsModal>(NO_MODAL);

  const { data: catalog } = useQuery(catalogQuery(searchState, pageState));
  const { data: alerts } = useQuery(stockAlertsQuery());
  const deleteProduct = useDeleteProduct();

  const handleSearchChange = (search: string) => {
    setSearchState(search);
    setPageState(1);
  };

  const handleDeleteClick = async (product: IProduct) => {
    const isConfirmed = await Confirm.call(deleteConfirmation(product.name));
    if (!isConfirmed) return;
    deleteProduct.mutate(product.id, { onSuccess: () => toast(DELETED_MESSAGE) });
  };

  return (
    <ProductsLayout
      search={searchState}
      filter={filterState}
      page={pageState}
      total={catalog?.total ?? 0}
      lowStockCount={alerts?.lowStock.length ?? 0}
      expiringCount={countExpiringProducts(alerts)}
      rows={buildProductRows(catalog?.items ?? [], alerts, filterState, todayKey())}
      modal={modalState}
      onSearchChange={handleSearchChange}
      onFilterClick={setFilterState}
      onPageChange={setPageState}
      onNewProductClick={() => setModalState({ kind: 'product' })}
      onEntryClick={() => setModalState({ kind: 'entry' })}
      onProductClick={(product) => setModalState({ kind: 'product', product })}
      onDeleteClick={(product) => void handleDeleteClick(product)}
      onModalClose={() => setModalState(NO_MODAL)}
    />
  );
}
