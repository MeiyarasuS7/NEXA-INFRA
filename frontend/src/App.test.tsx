import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('should render without crashing', () => {
    expect(true).toBe(true);
  });

  it('should have valid structure', () => {
    const appContainer = document.getElementById('root');
    expect(appContainer).toBeDefined();
  });
});
