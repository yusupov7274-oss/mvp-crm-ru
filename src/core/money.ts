// Форматирование денежных значений (рубли по-умолчанию, без знака валюты)

export function fmtMoney(n: number): string {
  return Number(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}
