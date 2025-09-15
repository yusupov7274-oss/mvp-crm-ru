// Типы для воронки продаж

export type FunnelRecord = {
  id: string;
  businessId: string;
  month: string;   // "01".."12"
  year: string;    // "2025"
  leads: number;       // Лиды
  meetings: number;    // Количество встреч
  sales: number;       // Количество продаж
  avgCheck: number;    // Средний чек новых продаж
  obligations: number; // Количество исполненных обязательств
};

// Расчётные значения (для UI)
export type FunnelComputed = {
  convMeetFromLeads: number; // %
  convSalesFromLeads: number; // %
  convSalesFromMeet: number; // %
  newRevenue: number; // sales * avgCheck
};
