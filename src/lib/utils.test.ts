import { cn } from './utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const hasBorder = true;
    expect(cn('p-4', hasBorder && 'border')).toBe('p-4 border');
  });

  it('should override conflicting classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('should handle various input types', () => {
    expect(cn('p-4', { 'm-2': true, 'rounded-md': false }, ['text-lg'])).toBe('p-4 m-2 text-lg');
  });

  it('should return an empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});
