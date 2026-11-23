import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Permission, type ProductInput } from '@beverage/shared';
import { toast } from '@presentation/utils/toast';
import { usePermission } from '@modules/auth/main/session';
import { useDeactivateProduct, useSaveProduct } from '@modules/products/main/products-queries';
import { DEACTIVATED_MESSAGE, NEW_PRODUCT_TITLE, SAVED_MESSAGE_BY_MODE } from './constants';
import { ProductFormLayout } from './layout';
import { productFormSchema, type TProductFormInput } from './schema';
import type { TProductFormFlowProps } from './types';
import { productFormDefaults } from './utils';

export function ProductFormController({ product, onClose }: TProductFormFlowProps) {
  const canEnterStock = usePermission(Permission.STOCK_WRITE);
  const save = useSaveProduct();
  const deactivate = useDeactivateProduct();
  const { register, handleSubmit, formState } = useForm<TProductFormInput, unknown, ProductInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults(product),
  });

  const handleSave = (input: ProductInput) =>
    save.mutate(product ? { id: product.id, input } : { input }, {
      onSuccess: () => {
        toast(SAVED_MESSAGE_BY_MODE[product ? 'edit' : 'new']);
        onClose();
      },
    });

  const handleDeactivateClick = () => {
    if (!product) return;
    deactivate.mutate(product.id, {
      onSuccess: () => {
        toast(DEACTIVATED_MESSAGE);
        onClose();
      },
    });
  };

  return (
    <ProductFormLayout
      title={product ? `Editar — ${product.name}` : NEW_PRODUCT_TITLE}
      product={product}
      register={register}
      fieldErrors={formState.errors}
      canEnterStock={canEnterStock}
      isSaving={save.isPending}
      onSubmit={handleSubmit(handleSave)}
      onDeactivateClick={handleDeactivateClick}
      onClose={onClose}
    />
  );
}
