import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TaskStore } from './task-store.js';

test('complete 把任务标记为完成并返回更新后的任务', () => {
  const store = new TaskStore();
  store.add('t1', '写文档');

  const updated = store.complete('t1');

  assert.equal(updated.id, 't1');
  assert.equal(updated.title, '写文档');
  assert.equal(updated.completed, true);
  // 存储中也已更新
  assert.equal(store.list().find((t) => t.id === 't1')?.completed, true);
});

test('重复完成同一任务保持幂等', () => {
  const store = new TaskStore();
  store.add('t1', '写文档');

  const first = store.complete('t1');
  const second = store.complete('t1');

  assert.deepEqual(second, first);
  assert.equal(store.list().length, 1);
  assert.equal(store.list()[0]?.completed, true);
});

test('完成不存在的任务抛出包含任务 ID 的错误', () => {
  const store = new TaskStore();
  store.add('t1', '写文档');

  assert.throws(
    () => store.complete('t9'),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /t9/);
      return true;
    },
  );
});

test('complete 不影响其他任务', () => {
  const store = new TaskStore();
  store.add('t1', '任务一');
  store.add('t2', '任务二');

  store.complete('t1');

  const tasks = store.list();
  assert.equal(tasks.length, 2);
  assert.deepEqual(tasks.map((t) => t.id).sort(), ['t1', 't2']);
  assert.equal(tasks.find((t) => t.id === 't2')?.completed, false);
  assert.equal(tasks.find((t) => t.id === 't1')?.completed, true);
});
