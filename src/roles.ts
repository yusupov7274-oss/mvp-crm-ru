// РОЛИ И ДОСТУПЫ (расширенная версия под мульти-бизнес и биржу)

export type Role = 'owner' | 'manager' | 'seller' | 'buyer';

/**
 * Единый контракт прав. Не меняем имена ключей в будущем,
 * чтобы UI оставался стабильным.
 */
export type Permissions = {
  // Админка пользователей/ролей
  manageUsers: boolean;

  // Глобальная видимость (владелец видит всё)
  viewAllBusinesses: boolean;

  // Назначение/снятие ответственных + работа с "биржей"
  assignBusinesses: boolean;

  // Карточка бизнеса
  viewBusiness: boolean;
  editBusiness: boolean;

  // Финансы
  viewFinancials: boolean;
  editFinancials: boolean;

  // Воронка
  viewFunnel: boolean;
  editFunnel: boolean;

  // Сводная/дашборды
  viewSummary: boolean;

  // Экспорт/файлы/задачи
  exportData: boolean;
  manageFiles: boolean;
  manageTasks: boolean;
};

/**
 * Базовые шаблоны прав для стандартных ролей.
 * При необходимости можно делать overrides на пользователя.
 */
export const PERMISSIONS: Record<Role, Permissions> = {
  owner: {
    manageUsers: true,
    viewAllBusinesses: true,
    assignBusinesses: true,

    viewBusiness: true,
    editBusiness: true,

    viewFinancials: true,
    editFinancials: true,

    viewFunnel: true,
    editFunnel: true,

    viewSummary: true,

    exportData: true,
    manageFiles: true,
    manageTasks: true,
  },

  manager: {
    manageUsers: false,
    viewAllBusinesses: false,
    assignBusinesses: false,

    viewBusiness: true,
    editBusiness: true,

    viewFinancials: true,
    editFinancials: true,

    viewFunnel: true,
    editFunnel: true,

    viewSummary: true,

    exportData: true,
    manageFiles: true,
    manageTasks: true,
  },

  seller: {
    manageUsers: false,
    viewAllBusinesses: false,
    assignBusinesses: false,

    viewBusiness: true,
    editBusiness: false,

    viewFinancials: true,   // может видеть свои финансы (по договорённости)
    editFinancials: false,

    viewFunnel: true,
    editFunnel: false,

    viewSummary: true,

    exportData: false,
    manageFiles: false,
    manageTasks: false,
  },

  buyer: {
    manageUsers: false,
    viewAllBusinesses: false,
    assignBusinesses: false,

    viewBusiness: true,     // видит урезанную витрину (UI ограничим отдельно)
    editBusiness: false,

    viewFinancials: false,
    editFinancials: false,

    viewFunnel: false,
    editFunnel: false,

    viewSummary: true,

    exportData: false,
    manageFiles: false,
    manageTasks: false,
  },
};

export function roleTitle(r: Role) {
  switch (r) {
    case 'owner': return 'Владелец (бог)';
    case 'manager': return 'Менеджер';
    case 'seller': return 'Собственник';
    case 'buyer': return 'Покупатель';
  }
}
