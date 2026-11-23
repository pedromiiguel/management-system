import { BRAND_FEATURES, BRAND_NAME } from '../constants';

export function BrandPanel() {
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
