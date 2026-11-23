import { ALL_PERMISSIONS, PERMISSION_LABELS } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import { Checkbox } from '../../components/checkbox';
import { RoleFormFlow } from '../role-form';
import { UserFormFlow } from '../user-form';
import type { TAccessLayoutProps } from './types';

export function AccessLayout({
  users,
  roles,
  modal,
  onNewUserClick,
  onNewRoleClick,
  onPermissionToggle,
  onModalClose,
}: TAccessLayoutProps) {
  const matrixStyle = { gridTemplateColumns: `1fr repeat(${roles.length}, 105px)` };

  return (
    <div className="grid grid-cols-[350px_1fr] gap-3 flex-1 min-h-0">
      <Card pad={8} className="overflow-auto">
        <div className="flex justify-between items-center px-2.5 pt-2 pb-1">
          <div className="s-card-title m-0">Usuários</div>
          <Button primary onClick={onNewUserClick}>
            + Novo usuário
          </Button>
        </div>
        <Table
          cols={['Nome', 'Perfil', 'Ativo']}
          widths="1fr 100px 60px"
          align={[null, null, 'center']}
          dense
          rows={users.map((user) => ({
            key: user.id,
            cells: [
              `${user.name} (${user.login})`,
              <Tag tone="accent">{user.role.name}</Tag>,
              <Checkbox isOn={user.active} />,
            ],
          }))}
        />
        <div className="s-dim text-[12.5px] p-2.5">
          O MVP opera apenas com o perfil Admin. Os demais perfis já ficam mapeados para a
          contratação futura.
        </div>
      </Card>

      <Card className="overflow-auto">
        <div className="flex justify-between items-center mb-2.5">
          <div className="s-card-title m-0">Matriz de permissões por perfil</div>
          <Button ghost onClick={onNewRoleClick}>
            + Novo perfil
          </Button>
        </div>
        <div className="s-table is-dense">
          <div className="s-tr s-th" style={matrixStyle}>
            <div>Funcionalidade</div>
            {roles.map((role) => (
              <div key={role.id} className="text-center">
                {role.name}
              </div>
            ))}
          </div>
          {ALL_PERMISSIONS.map((permission) => (
            <div key={permission} className="s-tr" style={matrixStyle}>
              <div>{PERMISSION_LABELS[permission]}</div>
              {roles.map((role) => (
                <div key={role.id} className="text-center">
                  <Checkbox
                    isOn={role.permissions.includes(permission)}
                    onChange={
                      role.system ? undefined : (isOn) => onPermissionToggle(role, permission, isOn)
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="s-dim text-[12.5px] mt-2.5">
          Permissões são conjuntos configuráveis por funcionalidade — novos perfis não exigem
          reprogramação.
        </div>
      </Card>

      {modal === 'user' ? <UserFormFlow roles={roles} onClose={onModalClose} /> : null}
      {modal === 'role' ? <RoleFormFlow onClose={onModalClose} /> : null}
    </div>
  );
}
