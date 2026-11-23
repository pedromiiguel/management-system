import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { TPickedProduct } from '../../components/product-picker/types';
import type { TStockEntryFormInput } from './schema';

export type TStockEntryFlowProps = { onClose: () => void };

export type TStockEntryFormProps = {
  product: TPickedProduct;
  onChangeProduct: () => void;
  onSaved: () => void;
};

export type TStockEntryFormLayoutProps = {
  product: TPickedProduct;
  register: UseFormRegister<TStockEntryFormInput>;
  fieldErrors: FieldErrors<TStockEntryFormInput>;
  isSaving: boolean;
  onChangeProductClick: () => void;
  onSubmit: () => void;
};
