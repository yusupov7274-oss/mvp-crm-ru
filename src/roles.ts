// РОЛИ И БАЗОВЫЕ ДОСТУПЫ (можно переопределять на уровне пользователя)

export type Role = 'owner' | 'manager' | 'seller' | 'buyer';

export type Permissions = {
  manageUsers: boolean;
  viewBusiness: boolean;
  editBusiness: boolean;
  viewFinancials: boolean;
  editFinancials: boolean;
  viewFunnel: boolean;
  editFunnel: boolean;
  viewSummary: boolean;
};

export const PERMISSIONS: Record<Role, Permissions> = {
  owner:   { manageUsers: true,  viewBusiness: true, editBusiness: true, viewFinancials: true, editFinancials: true, viewFunnel: true, editFunnel: true, viewSummary: true },
  manager: { manageUsers: false, viewBusiness: true, editBusiness: true, viewFinancials: true, editFinancials: true, viewFunnel: true, editFunnel: true, viewSummary: true },
  seller:  { manageUsers: false, viewBusiness: true, editBusiness: false, viewFinancials: true, editFinancials: false, viewFunnel: true, editFunnel: false, viewSummary: true },
  buyer:   { manageUsers: false, viewBusiness: true, editBusiness: false, viewFinancials: false, editFinancials: false, viewFunnel: false, editFunnel: false, viewSummary: true },
};

export function roleTitle(r: Role){
  return r === 'owner' ? 'Владелец (бог)' :
         r === 'manager' ? 'Менеджер' :
         r === 'seller' ? 'Собственник' : 'Покупатель';
}
