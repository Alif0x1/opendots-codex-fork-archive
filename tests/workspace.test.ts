import { expect, it } from 'vitest';
import { WorkspaceStore } from '../src/server/workspace.js';
it('persists spaces, specialist permissions, and canonical thread ownership', () => {
  const store = new WorkspaceStore(':memory:', 'owner');
  const space = store.createSpace('Design', 'Design decisions');
  const dot = store.createDot(space.id, 'Scout', 'Be concise', false, true);
  store.bindThread('thread-1', dot.id, 'Design research');
  expect(store.requireThread('thread-1', dot.id).ownerId).toBe('owner');
  expect(() => store.requireThread('thread-1', 'another-dot')).toThrow();
  expect(() => store.requireThread('unknown')).toThrow();
  expect(store.dot(dot.id)?.researchAllowed).toBe(false);
  store.close();
});
it('rejects a dot in a nonexistent space and does not rebind an existing thread', () => {
  const store = new WorkspaceStore(':memory:', 'owner');
  expect(() => store.createDot('missing', 'Dot', 'Help', true, true)).toThrow();
  const dots = store.dots();
  store.bindThread('one', dots[0].id, 'First');
  expect(() => store.bindThread('one', dots[0].id, 'Second')).toThrow();
  store.close();
});
