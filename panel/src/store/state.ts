import {IForm, IMenu, IService, ITenant, ITenantInfo, IUserClaims} from 'boot/api'

export interface StateInterface {
  user: IUserClaims | null;
  tenant: ITenantInfo | null;
  services: IService[];
  forms: IForm[];
  menus: IMenu[];
  permissions: string[];
  chatProps: Object | null;
  tenants: Array<ITenant> | null;
}

const state: StateInterface = {
  user: null,
  tenant: null,
  services: [],
  forms: [],
  menus: [],
  permissions: [],
  chatProps: {},
  tenants: []
}

export default state

