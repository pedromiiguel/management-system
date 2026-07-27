import { SBtn, SCheck, SModal } from '@/components/sol';
import type { RoleModalViewProps } from './RoleModal.types';

export function RoleModalView({
  name,
  onChangeName,
  permissionOptions,
  onTogglePermission,
  valid,
  saving,
  onSubmit,
  onClose,
}: RoleModalViewProps) {
  return (
    <SModal title="Novo perfil" onClose={onClose} width={460}>
      <div className="s-label">Nome do perfil</div>
      <div className="s-input mb-3">
        <input
          autoFocus
          data-testid="role-name"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="ex.: Caixa"
        />
      </div>
      <div className="s-label">Permissões</div>
      <div className="flex flex-col gap-1.5 max-h-[280px] overflow-auto">
        {permissionOptions.map(({ permission, label, on }) => (
          <label key={permission} className="flex items-center gap-2 text-[13.5px]">
            <SCheck on={on} onChange={(next) => onTogglePermission(permission, next)} />
            {label}
          </label>
        ))}
      </div>
      <div className="flex gap-2 justify-end mt-3.5">
        <SBtn ghost onClick={onClose}>
          Voltar
        </SBtn>
        <SBtn primary disabled={!valid || saving} onClick={onSubmit}>
          Criar perfil
        </SBtn>
      </div>
    </SModal>
  );
}
