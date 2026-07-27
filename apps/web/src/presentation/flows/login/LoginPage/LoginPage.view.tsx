import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/presentation/components/Button';
import { LoginBrandPanel } from '../components/LoginBrandPanel';
import type { LoginPageViewProps } from './LoginPage.types';

export function LoginPageView({
  register,
  errors,
  onSubmit,
  submitting,
  loginError,
  passwordVisible,
  onTogglePasswordVisible,
}: LoginPageViewProps) {
  return (
    <div className="s-login">
      <LoginBrandPanel />
      <div className="s-login-side">
        <form className="s-login-form" onSubmit={onSubmit}>
          <div className="text-[25px] font-extrabold text-[color:var(--ink-900)] tracking-[-0.01em]">
            Bem-vindo de volta
          </div>
          <div className="s-dim text-[13.5px] mt-[5px] mb-6">Entre com sua conta para abrir o caixa.</div>
          <div className="flex flex-col gap-3.5">
            <div>
              <div className="s-label">Usuário</div>
              <div className="s-input is-big">
                <input placeholder="seu login" aria-label="Usuário" autoFocus {...register('login')} />
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
                  onClick={onTogglePasswordVisible}
                  aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={passwordVisible}
                >
                  {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password ? <div className="s-error">{errors.password.message}</div> : null}
            </div>
            {loginError ? <div className="s-error">{loginError}</div> : null}
            {/* .s-btn não aceita className; margin fica no style prop do DS (mesmo padrão do CreditPanel) */}
            <Button primary big type="submit" disabled={submitting} style={{ marginTop: 8 }}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </div>
        </form>
        {/* Sem destino por ora — canal de suporte ainda não definido (Decisão 6 do ADR 0013) */}
        <div className="s-login-help">
          Problemas para entrar? <b>Falar com o suporte</b>
        </div>
      </div>
    </div>
  );
}
