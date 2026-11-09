import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Barcode, Boxes, CircleDollarSign, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginInput } from '@beverage/shared';
import { Button } from '@/components/Button';
import { http } from '@/lib/http';
import { safeRedirectTarget, startSession, type SessionUser } from '@/lib/session';

export function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: '/login' });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const login = useMutation({
    mutationFn: (input: LoginInput) =>
      http.post<{ accessToken: string; user: SessionUser }>('/auth/login', input),
    onSuccess: ({ accessToken, user }) => {
      startSession(accessToken, user);
      return navigate({ href: safeRedirectTarget(redirect), replace: true });
    },
    meta: { toastError: false },
  });

  return (
    <div className="s-login">
      <BrandPanel />
      <div className="s-login-side">
        <form className="s-login-form" onSubmit={handleSubmit((input) => login.mutate(input))}>
          <div className="text-[25px] font-extrabold text-[color:var(--ink-900)] tracking-[-0.01em]">
            Bem-vindo de volta
          </div>
          <div className="s-dim text-[13.5px] mt-[5px] mb-6">
            Entre com sua conta para abrir o caixa.
          </div>
          <div className="flex flex-col gap-3.5">
            <div>
              <div className="s-label">Usuário</div>
              <div className="s-input is-big">
                <input
                  placeholder="seu login"
                  aria-label="Usuário"
                  autoFocus
                  {...register('login')}
                />
              </div>
              {errors.login ? <div className="s-error">{errors.login.message}</div> : null}
            </div>
            <div>
              <div className="s-label">Senha</div>
              <div className="s-input is-big">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  aria-label="Senha"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="s-eye"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={passwordVisible}
                >
                  {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password ? <div className="s-error">{errors.password.message}</div> : null}
            </div>
            {login.error ? <div className="s-error">{login.error.message}</div> : null}
            <Button primary big type="submit" disabled={login.isPending} style={{ marginTop: 8 }}>
              {login.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </div>
        </form>
        {/* Sem destino por ora: canal de suporte ainda não definido. */}
        <div className="s-login-help">
          Problemas para entrar? <b>Falar com o suporte</b>
        </div>
      </div>
    </div>
  );
}

const BRAND_NAME = "Costa's Espetos";

const BRAND_FEATURES = [
  { icon: Barcode, label: 'Caixa rápido, leitura por código de barras' },
  { icon: Boxes, label: 'Estoque baixado a cada venda' },
  { icon: CircleDollarSign, label: 'Fechamento do dia sem planilha' },
];

function BrandPanel() {
  return (
    <div className="s-login-brand">
      <div className="s-login-glow" />
      <div className="s-login-halo" />
      <div className="s-login-halo is-2" />
      <div className="relative">
        <img className="s-login-logo" src="/logo.png" alt={BRAND_NAME} />
      </div>
      <div className="relative">
        <div className="s-login-lede">
          Vendas, estoque e <em>financeiro</em> num lugar só.
        </div>
        <div className="s-login-feats">
          {BRAND_FEATURES.map((feature) => (
            <div key={feature.label} className="s-login-feat">
              <i>
                <feature.icon size={16} />
              </i>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="s-login-foot">
        Distribuidora {BRAND_NAME}
        <span className="s-dot" />
        v1.0 · MVP
      </div>
    </div>
  );
}
