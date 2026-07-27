import { SBtn, SCard, SCheck, STable } from '@/components/sol';
import { RoleModal } from './components/RoleModal';
import { UserModal } from './components/UserModal';
import type { AccessTabViewProps } from './AccessTab.types';

export function AccessTabView({
  userRows,
  roleHeaders,
  permissionRows,
  roles,
  modal,
  onOpenUserModal,
  onOpenRoleModal,
  onCloseModal,
  onUserCreated,
  onRoleCreated,
}: AccessTabViewProps) {
  return (
    <div className="grid grid-cols-[350px_1fr] gap-3 flex-1 min-h-0">
      <SCard pad={8} className="overflow-auto">
        <div className="flex justify-between items-center px-2.5 pt-2 pb-1">
          <div className="s-card-title m-0">Usuários</div>
          <SBtn primary onClick={onOpenUserModal}>
            + Novo usuário
          </SBtn>
        </div>
        <STable cols={['Nome', 'Perfil', 'Ativo']} widths="1fr 100px 60px" align={[null, null, 'center']} dense rows={userRows} />
        <div className="s-dim text-[12.5px] p-2.5">
          O MVP opera apenas com o perfil Admin. Os demais perfis já ficam mapeados para a
          contratação futura.
        </div>
      </SCard>

      <SCard className="overflow-auto">
        <div className="flex justify-between items-center mb-2.5">
          <div className="s-card-title m-0">Matriz de permissões por perfil</div>
          <SBtn ghost onClick={onOpenRoleModal}>
            + Novo perfil
          </SBtn>
        </div>
        <div className="s-table is-dense">
          <div className="s-tr s-th" style={{ gridTemplateColumns: `1fr repeat(${roleHeaders.length}, 105px)` }}>
            <div>Funcionalidade</div>
            {roleHeaders.map((r) => (
              <div key={r.id} className="text-center">
                {r.name}
              </div>
            ))}
          </div>
          {permissionRows.map((row) => (
            <div
              key={row.key}
              className="s-tr"
              style={{ gridTemplateColumns: `1fr repeat(${roleHeaders.length}, 105px)` }}
            >
              <div>{row.label}</div>
              {row.cells.map((cell) => (
                <div key={cell.key} className="text-center">
                  <SCheck on={cell.on} onChange={cell.onChange} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="s-dim text-[12.5px] mt-2.5">
          Permissões são conjuntos configuráveis por funcionalidade — novos perfis não exigem
          reprogramação.
        </div>
      </SCard>

      {modal === 'user' ? <UserModal roles={roles} onDone={onUserCreated} onClose={onCloseModal} /> : null}
      {modal === 'role' ? <RoleModal onDone={onRoleCreated} onClose={onCloseModal} /> : null}
    </div>
  );
}
