import { ALL_PERMISSIONS, PERMISSION_LABELS } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Modal, ModalActions } from '@presentation/components/Modal';
import { Checkbox } from '../../components/checkbox';
import type { TRoleFormLayoutProps } from './types';

export function RoleFormLayout({
  register,
  permissions,
  canSubmit,
  onPermissionToggle,
  onSubmit,
  onClose,
}: TRoleFormLayoutProps) {
  return (
    <Modal title="Novo perfil" onClose={onClose} width={460}>
      <form onSubmit={onSubmit}>
        <div className="s-label">Nome do perfil</div>
        <div className="s-input mb-3">
          <input autoFocus data-testid="role-name" placeholder="ex.: Caixa" {...register('name')} />
        </div>
        <div className="s-label">Permissões</div>
        <div className="flex flex-col gap-1.5 max-h-[280px] overflow-auto">
          {ALL_PERMISSIONS.map((permission) => (
            <label key={permission} className="flex items-center gap-2 text-[13.5px]">
              <Checkbox
                isOn={permissions.includes(permission)}
                onChange={(isOn) => onPermissionToggle(permission, isOn)}
              />
              {PERMISSION_LABELS[permission]}
            </label>
          ))}
        </div>
        <ModalActions>
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary type="submit" disabled={!canSubmit}>
            Criar perfil
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
