import { Button } from '@presentation/components/Button';
import { Field } from '@presentation/components/Field';
import { Modal } from '@presentation/components/Modal';
import { CategorySelect } from '../../../components/category-select';
import type { TPayableFormLayoutProps } from './types';

export function PayableFormLayout({
  categories,
  register,
  canSubmit,
  onSubmit,
  onClose,
}: TPayableFormLayoutProps) {
  return (
    <Modal title="Nova conta a pagar" onClose={onClose} width={460}>
      <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
        <Field label="Descrição">
          <input autoFocus data-testid="payable-description" {...register('description')} />
        </Field>
        <div className="flex gap-2.5">
          <Field className="flex-1" label="Fornecedor — opcional">
            <input {...register('supplier')} />
          </Field>
          <Field className="w-[130px]" label="Valor (R$)">
            <input data-testid="payable-amount" placeholder="0,00" {...register('amount')} />
          </Field>
        </div>
        <div className="flex gap-2.5">
          <Field className="flex-1" label="Vencimento">
            <input type="date" {...register('dueDate')} />
          </Field>
          <Field className="flex-1" label="Categoria">
            <CategorySelect categories={categories} registration={register('categoryId')} />
          </Field>
        </div>
        <div className="flex gap-2 justify-end">
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary type="submit" disabled={!canSubmit}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
