import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { customerSchema, type CustomerInput } from '@beverage/shared';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { formatBRL } from '@/lib/format';
import { useDebounce } from '@/lib/useDebounce';
import { customerSearchQuery, useCreateCustomer, type Customer } from './api';
import { SALE_HOTKEYS } from './hotkeys';

export function CustomerModal({
  onPick,
  onClose,
}: {
  onPick: (customer: Customer) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const term = useDebounce(search, 300);
  const { data: customers = [] } = useQuery(customerSearchQuery(term));

  const createCustomer = useCreateCustomer();
  const { register, handleSubmit, reset, formState } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
  });

  const submit = handleSubmit((input) =>
    createCustomer.mutate(input, {
      onSuccess: (created) => {
        reset();
        onPick({ ...created, openBalance: 0 });
      },
    }),
  );

  return (
    <Modal
      title={`Cliente do fiado (${SALE_HOTKEYS.customer.label})`}
      onClose={onClose}
      width={460}
    >
      <div className="s-input mb-2.5">
        <Search size={15} />
        <input
          autoFocus
          placeholder="Buscar cliente…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <Table
        cols={['Nome', 'Em aberto']}
        widths="1fr 110px"
        align={[null, 'right']}
        dense
        emptyText="Nenhum cliente"
        rows={customers.map((customer) => ({
          key: customer.id,
          onClick: () => onPick(customer),
          cells: [customer.name, formatBRL(customer.openBalance)],
        }))}
      />
      <div className="s-divider" />
      <form className="flex gap-2" onSubmit={submit}>
        <div className="s-input flex-1">
          <input placeholder="Novo cliente — nome" {...register('name')} />
        </div>
        <Button ghost type="submit" disabled={!formState.isValid}>
          + Cadastrar
        </Button>
      </form>
    </Modal>
  );
}
