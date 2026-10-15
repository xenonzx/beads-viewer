import { describe, it, expect } from 'vitest';
import { buildBdArgs } from './utils/bd-cli';

describe('buildBdArgs', () => {
  it('adds --json without -C when no directory is set', () => {
    expect(buildBdArgs(['list'], undefined)).toEqual(['list', '--json']);
  });

  it('adds -C <dir> before --json when a directory is set', () => {
    expect(buildBdArgs(['list'], '/tmp/proj')).toEqual(['-C', '/tmp/proj', 'list', '--json']);
  });

  it('keeps command args intact', () => {
    expect(buildBdArgs(['show', 'BD-1'], '/tmp/proj')).toEqual([
      '-C', '/tmp/proj', 'show', 'BD-1', '--json',
    ]);
  });
});
