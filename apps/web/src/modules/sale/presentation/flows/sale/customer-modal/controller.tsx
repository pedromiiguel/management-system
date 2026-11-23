import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { customerSchema, type CustomerInput } from '@beverage/shared';
import { useDebounce } from '@presentation/hooks/use-debounce';
import { customerSearchQuery, useCreateCustomer } from '@modules/sale/main/sale-queries';
import { CustomerModalLayout } from './layout';
import type { TCustomerModalProps } from './types';

/** Cliente do fiado (F8): escolhe um da lista ou cadastra pelo nome. */
export function CustomerModalController({ onPick, onClose }: TCustomerModalProps) {
  const [searchState, setSearchState] = useState('');
  const term = useDebounce(searchState, 300);
  const { data: customers = [] } = useQuery(customerSearchQuery(term));
  const createCustomer = useCreateCustomer();
  const { register, handleSubmit, formState } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: { name: '' },
  });

  // Cadastrar já escolhe o cliente e fecha o modal: não há campo a limpar.
  const handleCreate = handleSubmit((input) =>
    createCustomer.mutate(input, {
      onSuccess: (created) => onPick({ ...created, openBalance: 0 }),
    }),
  );

  return (
    <CustomerModalLayout
      search={searchState}
      customers={customers}
      register={register}
      canCreate={formState.isValid}
      onSearchChange={setSearchState}
      onPick={onPick}
      onCreate={handleCreate}
      onClose={onClose}
    />
  );
}
