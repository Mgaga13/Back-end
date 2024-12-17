interface toNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}
export function toLowerCase(value: string): string {
  return value.toLowerCase();
}

export function trim(value: string): string {
  return value.trim();
}
export function toDate(value: string): Date {
  return new Date(value);
}

export function toBoolean(value: string): boolean {
  value = value.toLowerCase();
  return value === 'true' || value === '1' ? true : false;
}

export function toNumberPagination(
  value: string,
  opts: toNumberOptions = {},
): number {
  let newValue = Number.parseInt(value || String(opts.default), 10);
  if (Number.isNaN(newValue)) {
    newValue = opts.default;
  }
  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }
    if (newValue > opts.max) {
      newValue = opts.max;
    }
  }
  console.log('newValue====>', newValue);
  return newValue;
}

export function toNumberDto(value: string) {
  return Number(value);
}
