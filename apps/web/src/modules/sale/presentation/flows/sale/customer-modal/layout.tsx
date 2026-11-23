import { Search } from 'lucide-react';
import { Button } from '@presentation/components/Button';
import { Modal } from '@presentation/components/Modal';
import { Table } from '@presentation/components/Table';
import { formatBRL } from '@presentation/utils/format';
import { SALE_HOTKEYS } from '../constants';
import type { TCustomerModalLayoutProps } from './types';

export function CustomerModalLayout({
  search,
  customers,
  register,
  canCreate,
  onSearchChange,
  onPick,
  onCreate,
  onClose,
}: TCustomerModalLayoutProps) {
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
          onChange={(event) => onSearchChange(event.target.value)}
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
      <form className="flex gap-2" onSubmit={onCreate}>
        <div className="s-input flex-1">
          <input placeholder="Novo cliente — nome" {...register('name')} />
        </div>
        <Button ghost type="submit" disabled={!canCreate}>
          + Cadastrar
        </Button>
      </form>
    </Modal>
  );
}
