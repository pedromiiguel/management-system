import { SBtn, SolIcon } from '@/components/sol';
import type { LoginPageViewProps } from './LoginPage.types';

export function LoginPageView({ register, errors, onSubmit, submitting, loginError }: LoginPageViewProps) {
  return (
    <div className="s-login">
      <div className="s-login-brand">
        <div className="s-login-halo" />
        <div className="s-login-halo is-2" />
        <div className="relative">
          <span className="s-logo-mark w-14 h-14">
            <SolIcon name="sun" size={30} />
          </span>
          <div className="text-[30px] leading-[1.2] mt-5 font-normal">
            Distribuidora
            <br />
            <b className="tracking-[4px] font-extrabold">SOL</b>
          </div>
          <div className="text-sm opacity-60 mt-3.5 max-w-[240px] leading-normal">
            Vendas, estoque e financeiro num lugar só.
          </div>
        </div>
        <div className="relative text-xs opacity-45">v1.0 · MVP</div>
      </div>
      <div className="s-login-side">
        <form className="s-login-form" onSubmit={onSubmit}>
          <div className="text-2xl font-extrabold text-[color:var(--sol-900)]">Bem-vindo de volta</div>
          <div className="s-dim text-[13.5px] mt-1 mb-[26px]">Entre com sua conta para abrir o caixa.</div>
          <div className="flex flex-col gap-4">
            <div>
              <div className="s-label">Usuário</div>
              <div className="s-input">
                <input placeholder="seu login" aria-label="Usuário" autoFocus {...register('login')} />
              </div>
              {errors.login ? <div className="s-error">{errors.login.message}</div> : null}
            </div>
            <div>
              <div className="s-label">Senha</div>
              <div className="s-input">
                <input type="password" placeholder="••••••••" aria-label="Senha" {...register('password')} />
              </div>
              {errors.password ? <div className="s-error">{errors.password.message}</div> : null}
            </div>
            {loginError ? <div className="s-error">{loginError}</div> : null}
            {/* .s-btn não aceita className; margin fica no style prop do DS (mesmo padrão do CreditPanel) */}
            <SBtn primary big type="submit" disabled={submitting} style={{ marginTop: 8 }}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </SBtn>
            <span className="text-[13px] text-center text-[color:var(--accent-deep)] font-semibold">
              Esqueci minha senha
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
