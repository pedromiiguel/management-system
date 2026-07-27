import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PaymentMethod, Permission } from '@beverage/shared';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Regra de negócio com ramificação real alcançável a partir de `reports.tsx`
 * (ADR 0009): BR-05, estorno de venda concluída (`POST /sales/:id/void`).
 * A aritmética de `salesByPeriod`/`productPerformance` fica fora do gate —
 * sem ramificação de negócio, ver Decisão 6 da ADR 0009. Reset de schema
 * único para o arquivo, mesmo padrão de `products.e2e-spec.ts`.
 */
function resetDatabase(): void {
  const repoRoot = path.resolve(__dirname, '../../..');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execFileSync(npmCmd, ['run', 'db:reset', '--workspace', 'apps/api'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'Sim, pode resetar (Recomendado)',
    },
  });
}

describe('Reports — regras de negócio (ADR 0009)', () => {
  let app: INestApplication;
  let adminToken: string;
  /** Papel com SALES_OPERATE mas sem SALES_VOID — exercita a guarda de permissão do estorno. */
  let noVoidToken: string;
  let seq = 0;

  beforeAll(async () => {
    resetDatabase();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ login: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.accessToken;

    const role = await request(app.getHttpServer())
      .post('/api/users/roles')
      .set('Authorization', auth(adminToken))
      .send({ name: 'Operador sem estorno (teste)', permissions: [Permission.SALES_OPERATE] })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', auth(adminToken))
      .send({ name: 'Sem estorno', login: 'sem-estorno', password: 'senha123', roleId: role.body.id })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ login: 'sem-estorno', password: 'senha123' });
    noVoidToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  function auth(token: string) {
    return `Bearer ${token}`;
  }

  /** Cria um produto com estoque inicial `stock` e devolve seu SKU (usado como código de busca da venda). */
  async function createProduct(stock: number) {
    seq += 1;
    const sku = `TEST-REP-${seq}`;
    const created = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', auth(adminToken))
      .send({
        name: `Produto teste ${seq}`,
        sku,
        unit: 'un',
        purchasePrice: 5,
        salePrice: 10,
        minimumStock: 0,
        stockEntry: { quantity: stock },
      })
      .expect(201);
    return { id: created.body.id as string, sku };
  }

  /** Abre, adiciona 1 item (qty) e conclui uma venda; devolve a venda concluída. */
  async function completeSale(
    sku: string,
    quantity: number,
    body: { paymentMethod: PaymentMethod; customerId?: string; amountPaid?: number },
  ) {
    const opened = await request(app.getHttpServer())
      .post('/api/sales')
      .set('Authorization', auth(adminToken))
      .expect(201);
    const saleId = opened.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/sales/${saleId}/items`)
      .set('Authorization', auth(adminToken))
      .send({ code: sku, quantity })
      .expect(201);

    const completed = await request(app.getHttpServer())
      .post(`/api/sales/${saleId}/complete`)
      .set('Authorization', auth(adminToken))
      .send(body)
      .expect(201);

    return completed.body as { id: string; total: string };
  }

  async function createCustomer() {
    seq += 1;
    const created = await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', auth(adminToken))
      .send({ name: `Cliente teste ${seq}` })
      .expect(201);
    return created.body.id as string;
  }

  async function currentStock(productId: string) {
    const res = await request(app.getHttpServer())
      .get(`/api/products/${productId}`)
      .set('Authorization', auth(adminToken))
      .expect(200);
    return res.body.currentStock as number;
  }

  describe('BR-05: estorno de venda concluída', () => {
    it('venda à vista (PIX) — reverte estoque e cria saída de caixa', async () => {
      const product = await createProduct(10);
      const sale = await completeSale(product.sku, 3, { paymentMethod: PaymentMethod.PIX });
      expect(await currentStock(product.id)).toBe(7);

      const voided = await request(app.getHttpServer())
        .post(`/api/sales/${sale.id}/void`)
        .set('Authorization', auth(adminToken))
        .expect(201);
      expect(voided.body.status).toBe('CANCELLED');
      expect(await currentStock(product.id)).toBe(10);

      const today = new Date().toISOString().slice(0, 10);
      const cashFlow = await request(app.getHttpServer())
        .get('/api/financial/cash-flow')
        .query({ from: today, to: `${today}T23:59:59` })
        .set('Authorization', auth(adminToken))
        .expect(200);
      const outflow = cashFlow.body.movements.find(
        (m: { type: string; saleId?: string }) => m.type === 'OUTFLOW' && m.saleId === sale.id,
      );
      expect(outflow).toBeDefined();
    });

    it('venda fiado (CREDIT) não recebida — reverte estoque e apaga o fiado', async () => {
      const product = await createProduct(10);
      const customerId = await createCustomer();
      const sale = await completeSale(product.sku, 2, {
        paymentMethod: PaymentMethod.CREDIT,
        customerId,
      });

      const before = await request(app.getHttpServer())
        .get('/api/receivables')
        .query({ customerId })
        .set('Authorization', auth(adminToken))
        .expect(200);
      expect(before.body.some((r: { saleId: string }) => r.saleId === sale.id)).toBe(true);

      await request(app.getHttpServer())
        .post(`/api/sales/${sale.id}/void`)
        .set('Authorization', auth(adminToken))
        .expect(201);
      expect(await currentStock(product.id)).toBe(10);

      const after = await request(app.getHttpServer())
        .get('/api/receivables')
        .query({ customerId })
        .set('Authorization', auth(adminToken))
        .expect(200);
      expect(after.body.some((r: { saleId: string }) => r.saleId === sale.id)).toBe(false);
    });

    it('guarda: fiado já recebido bloqueia o estorno', async () => {
      const product = await createProduct(10);
      const customerId = await createCustomer();
      const sale = await completeSale(product.sku, 1, {
        paymentMethod: PaymentMethod.CREDIT,
        customerId,
      });
      const receivables = await request(app.getHttpServer())
        .get('/api/receivables')
        .query({ customerId })
        .set('Authorization', auth(adminToken))
        .expect(200);
      const receivableId = receivables.body.find((r: { saleId: string }) => r.saleId === sale.id).id;

      await request(app.getHttpServer())
        .post(`/api/receivables/${receivableId}/settle`)
        .set('Authorization', auth(adminToken))
        .send({ paymentMethod: PaymentMethod.PIX })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/api/sales/${sale.id}/void`)
        .set('Authorization', auth(adminToken));
      expect(res.status).toBe(409);
    });

    it('guarda: só vendas concluídas podem ser estornadas (rejeita reestorno)', async () => {
      const product = await createProduct(5);
      const sale = await completeSale(product.sku, 1, { paymentMethod: PaymentMethod.PIX });

      await request(app.getHttpServer())
        .post(`/api/sales/${sale.id}/void`)
        .set('Authorization', auth(adminToken))
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/api/sales/${sale.id}/void`)
        .set('Authorization', auth(adminToken));
      expect(res.status).toBe(409);
    });

    it('guarda de permissão: SALES_OPERATE sem SALES_VOID não pode estornar', async () => {
      const product = await createProduct(5);
      const sale = await completeSale(product.sku, 1, { paymentMethod: PaymentMethod.PIX });

      const res = await request(app.getHttpServer())
        .post(`/api/sales/${sale.id}/void`)
        .set('Authorization', auth(noVoidToken));
      expect(res.status).toBe(403);
    });
  });
});
