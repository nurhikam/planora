declare module "date-fns" {
  export function format(date: Date | number, format: string): string;
  export function startOfMonth(date: Date | number): Date;
  export function endOfMonth(date: Date | number): Date;
  export function startOfWeek(date: Date | number): Date;
  export function endOfWeek(date: Date | number): Date;
  export function addDays(date: Date | number, amount: number): Date;
  export function addMonths(date: Date | number, amount: number): Date;
  export function subMonths(date: Date | number, amount: number): Date;
  export function isSameMonth(
    date1: Date | number,
    date2: Date | number,
  ): boolean;
  export function isSameDay(
    date1: Date | number,
    date2: Date | number,
  ): boolean;
}
