import { createTestApp, TestApp } from './support/app';

/**
 * Índices parciais existem só em SQL (migração 20261109130100) — o
 * `schema.prisma` não os expressa, e um `prisma migrate dev` gera `DROP INDEX`
 * para eles. Este teste falha se uma migração os apagar.
 */
describe('Schema', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  it.each([
    ['cash_register', 'cash_register_single_open_key'],
    ['sale', 'sale_single_in_progress_per_operator_key'],
  ])('%s tem o índice parcial único %s', async (table, index) => {
    const rows = await t.prisma.$queryRaw<{ indexdef: string }[]>`
      SELECT indexdef FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = ${table} AND indexname = ${index}
    `;
    expect(rows).toEqual([{ indexdef: expect.stringMatching(/^CREATE UNIQUE INDEX .* WHERE /) }]);
  });
});
