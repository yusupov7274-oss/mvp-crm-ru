// Типы финансовых записей и расходов

export type Money = number;

export type Expenses = {
  rent: Money;         // Аренда
  payroll: Money;      // ФОТ
  internet: Money;     // Интернет
  telephony: Money;    // Телефония
  admin: Money;        // Административные расходы
  royalty: Money;      // Роялти (автоматически считается)
  taxes: Money;        // Налоги
  refunds: Money;      // Возвраты
  accounting: Money;   // Бухгалтерия
  marketing: Money;    // Маркетинг
};

export type FinancialRecord = {
  id: string;
  businessId: string;
  month: string;   // "01".."12"
  year: string;    // "2025"
  revenue: Money;

  // настройки роялти
  royaltyPercent: number;          // %
  royaltyIncludeRefunds: boolean;  // если true → база = (revenue - refunds)

  // авто-поля после пересчёта
  expenses: Expenses;
  net: Money;       // чистая прибыль
  margin: number;   // рентабельность, %
};
