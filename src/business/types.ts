// Доменные типы для бизнеса (вид, валюта, статусы, сущность Business)

export type BusinessKind = 'own' | 'franchise';
export type Currency = 'RUB' | 'BYN' | 'KZT';

export type BusinessStatus =
  | 'new'                    // Заявка взята в работу
  | 'assigned'               // менеджер определён
  | 'primary_collected'      // первичные данные собраны
  | 'price_estimated'        // стоимость определена
  | 'price_agreed'           // стоимость согласована с собственником
  | 'buyers_base_formed'     // база потенциальных покупателей сформирована
  | 'meetings'               // встречи идут
  | 'approved_buyer'         // есть одобренный покупатель
  | 'buyer_has_money'        // подтверждены деньги
  | 'signing'                // подписание договора
  | 'sold'                   // бизнес продан
  | 'archived';              // архив

export type Business = {
  id: string;
  title: string;
  city: string;
  direction: string;
  kind: BusinessKind;
  ownerContact: string;      // контакты собственника
  currency: Currency;
  responsibleId?: string | null; // менеджер-ответственный, null => биржа
  status: BusinessStatus;
  createdAt: string;
  updatedAt: string;
};

export function newBusiness(): Business {
  const now = new Date().toISOString();
  return {
    id: cryptoRandomId(),
    title: '',
    city: '',
    direction: '',
    kind: 'own',
    ownerContact: '',
    currency: 'RUB',
    responsibleId: null,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };
}

export function cryptoRandomId() {
  try {
    // в браузерах есть crypto.getRandomValues
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return [...a].map(x => x.toString(36)).join('');
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}
