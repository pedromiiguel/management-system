import { Search } from 'lucide-react';
import { Button } from '@/presentation/components/Button';
import { Modal } from '@/presentation/components/Modal';
import { Table } from '@/presentation/components/Table';
import type { CustomerModalViewProps } from './CustomerModal.types';

export function CustomerModalView({
  registerFilter,
  rows,
  register,
  onSubmit,
  canCreate,
  onClose,
}: CustomerModalViewProps) {
  return (
    <Modal title="Cliente do fiado (F8)" onClose={onClose} width={460}>
      <div className="s-input mb-2.5">
        <Search size={15} />
        <input autoFocus placeholder="Buscar cliente…" {...registerFilter('search')} />
      </div>
      <Table
        cols={['Nome', 'Em aberto']}
        widths="1fr 110px"
        align={[null, 'right']}
        dense
        emptyText="Nenhum cliente"
        rows={rows}
      />
      <div className="s-divider" />
      <form className="flex gap-2" onSubmit={onSubmit}>
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
