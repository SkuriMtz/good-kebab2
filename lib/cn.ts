type ClassValue = string | false | null | undefined | 0;

/** Une clases y descarta las vacías. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
