import { PrismaService } from '../../prisma/prisma.service';
import { SessionService } from './session.service';

const row = (name: string) => ({
  id: 'u1',
  name,
  login: 'u1',
  roleId: 'r1',
  active: true,
  role: { name: 'Caixa', system: false, permissions: [] },
});

describe('SessionService', () => {
  it('leitura em andamento durante invalidate() não repõe o cache com o dado antigo', async () => {
    let finishStale!: (v: unknown) => void;
    const findUnique = jest
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => (finishStale = resolve)))
      .mockResolvedValue(row('Novo'));
    const sessions = new SessionService({ user: { findUnique } } as unknown as PrismaService);

    const stale = sessions.resolve('u1');
    sessions.invalidate();
    finishStale(row('Antigo'));
    expect((await stale)?.name).toBe('Antigo');

    expect((await sessions.resolve('u1'))?.name).toBe('Novo');
    expect(findUnique).toHaveBeenCalledTimes(2);
  });

  it('sem invalidate(), a segunda leitura vem do cache', async () => {
    const findUnique = jest.fn().mockResolvedValue(row('Ana'));
    const sessions = new SessionService({ user: { findUnique } } as unknown as PrismaService);
    await sessions.resolve('u1');
    await sessions.resolve('u1');
    expect(findUnique).toHaveBeenCalledTimes(1);
  });
});
