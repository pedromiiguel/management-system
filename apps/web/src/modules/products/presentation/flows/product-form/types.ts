import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { IProduct } from '../../../domain/product-model';
import type { TProductFormInput } from './schema';

export type TProductFormFlowProps = { product?: IProduct; onClose: () => void };

export type TProductFormLayoutProps = {
  title: string;
  product: IProduct | undefined;
  register: UseFormRegister<TProductFormInput>;
  fieldErrors: FieldErrors<TProductFormInput>;
  canEnterStock: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  onDeactivateClick: () => void;
  onClose: () => void;
};
