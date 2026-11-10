import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSaleQueue, PendingQuantityError } from './sale-queue';

function setup(commitQuantity = vi.fn(async (_itemId: string, _quantity: number) => {})) {
  const onQuantityError = vi.fn();
  const pending: Record<string, number>[] = [];
  const queue = createSaleQueue({
    delayMs: 400,
    commitQuantity,
    onQuantityError,
    onPendingChange: (p) => pending.push(p),
  });
  return { queue, commitQuantity, onQuantityError, pending, lastPending: () => pending.at(-1) };
}

describe('createSaleQueue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounces quantity changes into a single commit of the last value', async () => {
    const { queue, commitQuantity, lastPending } = setup();
    queue.setQuantity('a', 2);
    await vi.advanceTimersByTimeAsync(300);
    queue.setQuantity('a', 5);
    expect(lastPending()).toEqual({ a: 5 });
    await vi.advanceTimersByTimeAsync(300);
    expect(commitQuantity).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(commitQuantity).toHaveBeenCalledTimes(1);
    expect(commitQuantity).toHaveBeenCalledWith('a', 5);
    expect(lastPending()).toEqual({});
  });

  it('accumulates rapid +/- steps from the shown value, not the stale render', async () => {
    const { queue, commitQuantity } = setup();
    queue.stepQuantity('a', 1, 1);
    queue.stepQuantity('a', 1, 1);
    queue.stepQuantity('a', 1, 1);
    queue.stepQuantity('a', 1, -1);
    await vi.advanceTimersByTimeAsync(400);
    expect(commitQuantity).toHaveBeenCalledExactlyOnceWith('a', 3);
  });

  it('ignores quantities below 1 or fractional', async () => {
    const { queue, commitQuantity } = setup();
    queue.stepQuantity('a', 1, -1);
    queue.setQuantity('a', 1.5);
    await vi.advanceTimersByTimeAsync(1000);
    expect(commitQuantity).not.toHaveBeenCalled();
  });

  it('run() commits pending quantities before the task, without waiting the debounce', async () => {
    const calls: string[] = [];
    const { queue } = setup(
      vi.fn(async (itemId: string, quantity: number) => {
        calls.push(`qty ${itemId}=${quantity}`);
      }),
    );
    queue.setQuantity('a', 4);
    queue.setQuantity('b', 2);
    await queue.run(async () => calls.push('task'));
    expect(calls).toEqual(['qty a=4', 'qty b=2', 'task']);
    await vi.advanceTimersByTimeAsync(1000);
    expect(calls).toHaveLength(3);
  });

  it('run() aborts with PendingQuantityError when a quantity commit fails', async () => {
    const error = new Error('estoque insuficiente');
    const { queue, onQuantityError, lastPending } = setup(
      vi.fn(async () => {
        throw error;
      }),
    );
    const task = vi.fn(async () => 'done');
    queue.setQuantity('a', 9);
    await expect(queue.run(task)).rejects.toBeInstanceOf(PendingQuantityError);
    expect(task).not.toHaveBeenCalled();
    expect(onQuantityError).toHaveBeenCalledWith(error);
    expect(lastPending()).toEqual({});
  });

  it('serializes operations: a task never overlaps an in-flight commit', async () => {
    const log: string[] = [];
    let release!: () => void;
    const { queue } = setup(
      vi.fn(async () => {
        log.push('commit start');
        await new Promise<void>((resolve) => (release = resolve));
        log.push('commit end');
      }),
    );
    queue.setQuantity('a', 2);
    await vi.advanceTimersByTimeAsync(400);
    const done = queue.run(async () => log.push('task'));
    await vi.advanceTimersByTimeAsync(0);
    expect(log).toEqual(['commit start']);
    release();
    await done;
    expect(log).toEqual(['commit start', 'commit end', 'task']);
  });

  it('keeps showing a newer value typed while an older one is in flight', async () => {
    let release!: () => void;
    const { queue, lastPending } = setup(
      vi.fn(() => new Promise<void>((resolve) => (release = resolve))),
    );
    queue.setQuantity('a', 2);
    await vi.advanceTimersByTimeAsync(400);
    queue.setQuantity('a', 3);
    release();
    await vi.advanceTimersByTimeAsync(0);
    expect(lastPending()).toEqual({ a: 3 });
  });

  it('a failed task does not block the next one', async () => {
    const { queue } = setup();
    await expect(
      queue.run(async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    await expect(queue.run(async () => 'ok')).resolves.toBe('ok');
  });

  it('reset() drops pending quantities', async () => {
    const { queue, commitQuantity, lastPending } = setup();
    queue.setQuantity('a', 3);
    queue.reset();
    expect(lastPending()).toEqual({});
    await vi.advanceTimersByTimeAsync(1000);
    await queue.commitPending();
    expect(commitQuantity).not.toHaveBeenCalled();
  });
});
