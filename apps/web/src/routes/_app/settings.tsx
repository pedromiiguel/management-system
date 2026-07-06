import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ALL_PERMISSIONS,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  PERMISSION_LABELS,
  StockPolicy,
  type Permission,
} from '@beverage/shared';
import { Screen } from '../_app';
import {
  SBtn,
  SCard,
  SCheck,
  SChip,
  SModal,
  SSeg,
  STable,
  STag,
  SToggle,
  useToast,
} from '../../components/sol';
import { api, apiErrorMessage } from '../../lib/api';
import { parseMoney } from '../../lib/format';
import type { AppSettings, FinancialCategory, Role, UserRow } from '../../lib/types';

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
});

type Tab = 'general' | 'access' | 'categories';

function SettingsPage() {
  const [tab, setTab] = useState<Tab>('general');
  return (
    <Screen title={tab === 'access' ? 'Usuários & Perfis' : 'Configurações'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
        <SSeg<Tab>
          items={[
            { id: 'general', label: 'Geral' },
            { id: 'access', label: 'Usuários & Perfis' },
            { id: 'categories', label: 'Categorias financeiras' },
          ]}
          active={tab}
          onChange={setTab}
        />
        {tab === 'general' && <GeneralTab />}
        {tab === 'access' && <AccessTab />}
        {tab === 'categories' && <CategoriesTab />}
      </div>
    </Screen>
  );
}

// ---------- Geral (NFR-10) ----------

function GeneralTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<AppSettings>('/settings')).data,
  });
  const [target, setTarget] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: async (patch: Record<string, unknown>) =>
      (await api.put<AppSettings>('/settings', patch)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
      void queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast('Configuração salva');
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  if (!settings) return null;
  const targetValue = target ?? (settings.revenueTargetMonthly?.toFixed(2).replace('.', ',') || '');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
      <SCard>
        <div className="s-card-title">Venda sem estoque (BR-03 / FR-15)</div>
        <div className="s-dim" style={{ fontSize: 12.5, marginBottom: 10 }}>
          O que o PDV faz ao bipar um produto sem saldo disponível.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SChip
            active={settings.stockPolicy === StockPolicy.BLOCK}
            onClick={() => update.mutate({ stockPolicy: StockPolicy.BLOCK })}
          >
            Bloquear a venda
          </SChip>
          <SChip
            active={settings.stockPolicy === StockPolicy.WARN}
            onClick={() => update.mutate({ stockPolicy: StockPolicy.WARN })}
          >
            Apenas avisar
          </SChip>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Formas de pagamento habilitadas (FR-17)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.values(PaymentMethod).map((method) => (
            <SToggle
              key={method}
              on={settings.enabledPaymentMethods.includes(method)}
              label={PAYMENT_METHOD_LABELS[method]}
              onChange={(on) => {
                const next = on
                  ? [...settings.enabledPaymentMethods, method]
                  : settings.enabledPaymentMethods.filter((m) => m !== method);
                if (next.length === 0) {
                  toast('Mantenha ao menos uma forma de pagamento', 'warn');
                  return;
                }
                update.mutate({ enabledPaymentMethods: next });
              }}
            />
          ))}
        </div>
      </SCard>
      <SCard>
        <div className="s-card-title">Meta de faturamento mensal (FR-36 — opcional)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="s-input" style={{ flex: 1 }}>
            <input
              value={targetValue}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="ex.: 50000,00"
            />
          </div>
          <SBtn
            primary
            onClick={() => {
              const value = parseMoney(targetValue);
              if (!Number.isFinite(value)) {
                toast('Valor inválido', 'warn');
                return;
              }
              update.mutate({ revenueTargetMonthly: value });
            }}
          >
            Salvar
          </SBtn>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Alerta de validade (FR-08)</div>
        <div className="s-dim" style={{ fontSize: 12.5, marginBottom: 8 }}>
          Avisar quando faltarem até N dias para o vencimento do lote.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[15, 30, 60].map((days) => (
            <SChip
              key={days}
              active={settings.expiryAlertDays === days}
              onClick={() => update.mutate({ expiryAlertDays: days })}
            >
              {days} dias
            </SChip>
          ))}
        </div>
      </SCard>
    </div>
  );
}

// ---------- Usuários & Perfis (design HifiRoles, NFR-05) ----------

function AccessTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<'none' | 'user' | 'role'>('none');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<UserRow[]>('/users')).data,
  });
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get<Role[]>('/users/roles/all')).data,
  });

  const updateRole = useMutation({
    mutationFn: async ({ role, permissions }: { role: Role; permissions: string[] }) =>
      (await api.patch(`/users/roles/${role.id}`, { name: role.name, permissions })).data,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['roles'] }),
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 12, flex: 1, minHeight: 0 }}>
      <SCard pad={8} style={{ overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px 4px' }}>
          <div className="s-card-title" style={{ margin: 0 }}>Usuários</div>
          <SBtn primary onClick={() => setModal('user')}>+ Novo usuário</SBtn>
        </div>
        <STable
          cols={['Nome', 'Perfil', 'Ativo']}
          widths="1fr 100px 60px"
          align={[null, null, 'center']}
          dense
          rows={users.map((u) => ({
            key: u.id,
            cells: [
              `${u.name} (${u.login})`,
              <STag key="r" tone="accent">{u.role.name}</STag>,
              <SCheck key="a" on={u.active} />,
            ],
          }))}
        />
        <div className="s-dim" style={{ fontSize: 12.5, padding: 10 }}>
          O MVP opera apenas com o perfil Admin. Os demais perfis já ficam mapeados para a
          contratação futura.
        </div>
      </SCard>

      <SCard style={{ overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="s-card-title" style={{ margin: 0 }}>Matriz de permissões por perfil</div>
          <SBtn ghost onClick={() => setModal('role')}>+ Novo perfil</SBtn>
        </div>
        <div className="s-table is-dense">
          <div className="s-tr s-th" style={{ gridTemplateColumns: `1fr repeat(${roles.length}, 105px)` }}>
            <div>Funcionalidade</div>
            {roles.map((r) => (
              <div key={r.id} style={{ textAlign: 'center' }}>{r.name}</div>
            ))}
          </div>
          {ALL_PERMISSIONS.map((permission) => (
            <div
              key={permission}
              className="s-tr"
              style={{ gridTemplateColumns: `1fr repeat(${roles.length}, 105px)` }}
            >
              <div>{PERMISSION_LABELS[permission as Permission]}</div>
              {roles.map((role) => {
                const on = role.permissions.includes(permission);
                return (
                  <div key={role.id} style={{ textAlign: 'center' }}>
                    <SCheck
                      on={on}
                      onChange={
                        role.system
                          ? undefined // Admin (system) é imutável — evita lockout
                          : (next) =>
                              updateRole.mutate({
                                role,
                                permissions: next
                                  ? [...role.permissions, permission]
                                  : role.permissions.filter((p) => p !== permission),
                              })
                      }
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="s-dim" style={{ fontSize: 12.5, marginTop: 10 }}>
          Permissões são conjuntos configuráveis por funcionalidade — novos perfis não exigem
          reprogramação.
        </div>
      </SCard>

      {modal === 'user' && (
        <UserModal
          roles={roles}
          onDone={() => {
            void queryClient.invalidateQueries({ queryKey: ['users'] });
            setModal('none');
          }}
          onClose={() => setModal('none')}
        />
      )}
      {modal === 'role' && (
        <RoleModal
          onDone={() => {
            void queryClient.invalidateQueries({ queryKey: ['roles'] });
            setModal('none');
          }}
          onClose={() => setModal('none')}
        />
      )}
    </div>
  );
}

function UserModal({
  roles,
  onDone,
  onClose,
}: {
  roles: Role[];
  onDone: () => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '');

  const valid = name.trim().length > 0 && login.trim().length >= 3 && password.length >= 6 && roleId;

  const save = useMutation({
    mutationFn: async () =>
      (await api.post('/users', { name, login, password, roleId, active: true })).data,
    onSuccess: () => {
      toast('Usuário criado');
      onDone();
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <SModal title="Novo usuário" onClose={onClose} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div className="s-label">Nome</div>
          <div className="s-input"><input autoFocus value={name} onChange={(e) => setName(e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="s-label">Login</div>
            <div className="s-input"><input value={login} onChange={(e) => setLogin(e.target.value)} /></div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="s-label">Senha (mín. 6)</div>
            <div className="s-input">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        </div>
        <div>
          <div className="s-label">Perfil</div>
          <div className="s-input">
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <SBtn ghost onClick={onClose}>Voltar</SBtn>
          <SBtn primary disabled={!valid || save.isPending} onClick={() => save.mutate()}>Criar</SBtn>
        </div>
      </div>
    </SModal>
  );
}

function RoleModal({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  const save = useMutation({
    mutationFn: async () => (await api.post('/users/roles', { name, permissions })).data,
    onSuccess: () => {
      toast('Perfil criado');
      onDone();
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <SModal title="Novo perfil" onClose={onClose} width={460}>
      <div className="s-label">Nome do perfil</div>
      <div className="s-input" style={{ marginBottom: 12 }}>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="ex.: Caixa" />
      </div>
      <div className="s-label">Permissões</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflow: 'auto' }}>
        {ALL_PERMISSIONS.map((permission) => (
          <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <SCheck
              on={permissions.includes(permission)}
              onChange={(on) =>
                setPermissions((prev) =>
                  on ? [...prev, permission] : prev.filter((p) => p !== permission),
                )
              }
            />
            {PERMISSION_LABELS[permission as Permission]}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
        <SBtn ghost onClick={onClose}>Voltar</SBtn>
        <SBtn
          primary
          disabled={name.trim().length === 0 || permissions.length === 0 || save.isPending}
          onClick={() => save.mutate()}
        >
          Criar perfil
        </SBtn>
      </div>
    </SModal>
  );
}

// ---------- Categorias financeiras (NFR-10) ----------

function CategoriesTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const { data: categories = [] } = useQuery({
    queryKey: ['financial', 'categories'],
    queryFn: async () => (await api.get<FinancialCategory[]>('/financial/categories')).data,
  });

  const create = useMutation({
    mutationFn: async () => (await api.post('/financial/categories', { name, kind })).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['financial', 'categories'] });
      setName('');
      toast('Categoria criada');
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <SCard style={{ maxWidth: 560 }}>
      <div className="s-card-title">Categorias de receitas e despesas</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div className="s-input" style={{ flex: 1 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova categoria…" />
        </div>
        <SChip active={kind === 'EXPENSE'} onClick={() => setKind('EXPENSE')}>Despesa</SChip>
        <SChip active={kind === 'INCOME'} onClick={() => setKind('INCOME')}>Receita</SChip>
        <SBtn primary disabled={name.trim().length === 0 || create.isPending} onClick={() => create.mutate()}>
          Adicionar
        </SBtn>
      </div>
      <STable
        cols={['Categoria', 'Tipo', 'Origem']}
        widths="1fr 110px 90px"
        dense
        rows={categories.map((c) => ({
          key: c.id,
          cells: [
            c.name,
            c.kind === 'INCOME' ? <STag key="k" tone="ok">receita</STag> : <STag key="k" tone="warn">despesa</STag>,
            c.system ? <STag key="s" tone="dim">sistema</STag> : '—',
          ],
        }))}
      />
    </SCard>
  );
}
