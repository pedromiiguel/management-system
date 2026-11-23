import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@presentation/components/Button';
import { BrandPanel } from './components/brand-panel';
import { PASSWORD_TOGGLE_LABEL_BY_VISIBLE, SUBMIT_LABEL_BY_PENDING } from './constants';
import type { TLoginLayoutProps } from './types';

const SUBMIT_STYLE = { marginTop: 8 };

export function LoginLayout({
  register,
  fieldErrors,
  submitError,
  isSubmitting,
  isPasswordVisible,
  onTogglePasswordClick,
  onSubmit,
}: TLoginLayoutProps) {
  const PasswordIcon = isPasswordVisible ? EyeOff : Eye;
  const passwordInputType = isPasswordVisible ? 'text' : 'password';

  return (
    <div className="s-login">
      <BrandPanel />
      <div className="s-login-side">
        <form className="s-login-form" onSubmit={onSubmit}>
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
              {fieldErrors.login ? (
                <div className="s-error">{fieldErrors.login.message}</div>
              ) : null}
            </div>
            <div>
              <div className="s-label">Senha</div>
              <div className="s-input is-big">
                <input
                  type={passwordInputType}
                  placeholder="••••••••"
                  aria-label="Senha"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="s-eye"
                  onClick={onTogglePasswordClick}
                  aria-label={PASSWORD_TOGGLE_LABEL_BY_VISIBLE[`${isPasswordVisible}`]}
                  aria-pressed={isPasswordVisible}
                >
                  <PasswordIcon size={17} />
                </button>
              </div>
              {fieldErrors.password ? (
                <div className="s-error">{fieldErrors.password.message}</div>
              ) : null}
            </div>
            {submitError ? <div className="s-error">{submitError}</div> : null}
            <Button primary big type="submit" disabled={isSubmitting} style={SUBMIT_STYLE}>
              {SUBMIT_LABEL_BY_PENDING[`${isSubmitting}`]}
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
