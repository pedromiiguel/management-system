import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { TPickedProduct } from '../../components/product-picker/types';
import type { TStockAdjustmentFormInput } from './schema';

export type TStockAdjustmentFlowProps = { onClose: () => void };

export type TStockAdjustmentFormProps = {
  product: TPickedProduct;
  onChangeProduct: () => void;
  onSaved: () => void;
};

export type TStockAdjustmentFormLayoutProps = {
  product: TPickedProduct;
  register: UseFormRegister<TStockAdjustmentFormInput>;
  fieldErrors: FieldErrors<TStockAdjustmentFormInput>;
  canSubmit: boolean;
  isSaving: boolean;
  onChangeProductClick: () => void;
  onSubmit: () => void;
};
