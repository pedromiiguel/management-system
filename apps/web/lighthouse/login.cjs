// Roda antes de cada página medida pelo Lighthouse (lhci `puppeteerScript`):
// fora do /login, entra uma vez com o admin do seed e grava a sessão no localStorage, do jeito
// que `src/lib/session.ts` lê. O login passa pelo proxy `/api` do `vite preview`.
const SESSION_TOKEN_KEY = 'sol.token';
const SESSION_USER_KEY = 'sol.user';

module.exports = async (browser, { url }) => {
  // A tela de login é medida sem sessão (com sessão ela redireciona para o PDV).
  if (new URL(url).pathname === '/login') return;
  const page = await browser.newPage();
  await page.goto(new URL('/login', url).href, { waitUntil: 'domcontentloaded' });
  const error = await page.evaluate(
    async (tokenKey, userKey, login, password) => {
      if (localStorage.getItem(tokenKey)) return null;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      if (!res.ok) return `login falhou: HTTP ${res.status}`;
      const { accessToken, user } = await res.json();
      localStorage.setItem(tokenKey, accessToken);
      localStorage.setItem(userKey, JSON.stringify(user));
      return null;
    },
    SESSION_TOKEN_KEY,
    SESSION_USER_KEY,
    process.env.LHCI_LOGIN ?? 'admin',
    process.env.LHCI_PASSWORD ?? 'admin123',
  );
  await page.close();
  if (error) throw new Error(error);
};
