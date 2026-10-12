import {axios, AxiosInstance, SetBearerToken} from './axios'
import {boot} from "quasar/wrappers";

declare module 'vue/types/vue' {
  interface Vue {
    $api: Api;
  }
}

//#region Global Interfaces
interface IResponse<T> {
  isSuccess: boolean
  messages: any,
  model: T
}

interface IDataGridSortInfo {
  fieldName: string
  descending: boolean
}

interface IDataGridFilterInfo {
  fieldName: string
  operator: string
  value: any
}

interface OperationResult<T> {
  success: boolean
  error: any,
  result: T
}

//#endregion Global Interfaces

//#region Service
export interface IService {
  id: number
  name: string
  title: string
  baseUrl: string
  models: any[]
}

export interface SaanaaServices {
  services: IService[]
  version: string
}

class ServiceList {
  baseUrl: string

  constructor(baseURL: string) {
    this.baseUrl = baseURL
  }

  get = async () => {
    let config = JSON.parse(localStorage.getItem('services') || '{}')

    const res = (await axios.get<OperationResult<SaanaaServices>>(`service/services`,
      {
        baseURL: this.baseUrl,
        params: {
          version: config.version
          // @ts-ignore
        }, noNotify: true
      }) as any)

    if (!res.data.success || res.data.result == null) {
      return config.services
    }
    if (res.data.result && res.data.result.services && res.data.result.services.length > 0)
      localStorage.setItem('services', JSON.stringify(res.data.result))
    return res.data.result.services
  }
}

class ServiceProvider {
  constructor() {
  }

  async getDropdown<T>(url: string, searchValue: string | null = null, ids: number | null = null, filters: any) {
    try {
      const res = await axios.get<OperationResult<T>>('dropdown', {
        baseURL: url, params: {
          searchValue,
          ids,
          filters: JSON.stringify(filters || [])
        }
      })
      if (res.data.success) {
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return null
  }

  async getPage<T>(baseUrl: string, model: string, page: number, take: number, sort: string, filter: IDataGridFilterInfo[]) {
    try {
      const res = await axios.get<OperationResult<T>>(model, {baseURL: baseUrl, params: {page, take, sort, filter}})
      if (res.data.success) {
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return null
  }

  async getReport<T>(baseUrl: string, serviceName: string, modelName: string, page: number, take: number, sort: string, filter: IDataGridFilterInfo[], reportParams: any) {
    try {

      const res = await axios.post<OperationResult<T>>(`${baseUrl}/Core/Report/execute`, {
          page,
          take,
          sort,
          filter,
          serviceName,
          modelName,
          reportParams
        },
        // @ts-ignore
        {noNotify: true})
      // @ts-ignore
      if (res.data.success) {
        // @ts-ignore
        return res.data.result
      } else {
        // @ts-ignore
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return null
  }

  async get<T>(baseUrl: string, model: string, id: number) {
    try {
      const res = await axios.get<OperationResult<T>>(`${model}/${id}`, {baseURL: baseUrl})
      if (res.data.success) {
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return null
  }

  async add(baseUrl: string, modelName: string, data: any) {
    try {
      const res = await axios.post<OperationResult<number>>(modelName, data, {baseURL: baseUrl})
      if (res.data.success) {
        console.log('okate')
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return null
  }

  async update(baseUrl: string, model: string, data: any) {
    try {
      const res = await axios.put<OperationResult<boolean>>(model, data, {baseURL: baseUrl})
      if (res.data.success) {
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return null
  }

  async remove(baseUrl: string, model: string, id: number) {
    try {
      const res = await axios.delete(`${model}/${id}`, {baseURL: baseUrl})
      if (res.data.success) {
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return null
  }
}

//#endregion Service

//#region Form
export interface IForm {
  id: number
  name: string
  title: string
  description: string
  layout: string
  isAddable: boolean
  isUpdatable: boolean
  isDeletable: boolean
  isActive: boolean
  tenantId: number
  baseUrl: string
  properties: any[]
}

export interface SaanaaForms {
  forms: IForm[]
  version: string
}

class FormList {
  baseUrl: string

  constructor(baseURL: string) {
    this.baseUrl = baseURL
  }

  get = async () => {
    let config = JSON.parse(localStorage.getItem('forms') || '{}')

    const res = (await axios.get<OperationResult<SaanaaForms>>(`form/config`,
      {
        baseURL: this.baseUrl,
        params: {
          version: config.version
          // @ts-ignore
        }, noNotify: true
      }) as any)

    if (!res.data.success || res.data.result == null) {
      return config.forms
    }
    if (res.data.result && res.data.result.forms && res.data.result.forms.length > 0)
      localStorage.setItem('forms', JSON.stringify(res.data.result))
    return res.data.result.forms
  }
}

class FormProvider {

  constructor() {
  }

  getGrid = async (baseUrl: any, formName: string, params: object): Promise<Array<any>> => {
    try {
      const res = await axios.get<OperationResult<Array<any>>>(`flow/form/${formName}`, {
        baseURL: baseUrl,
        params
      })
      if (res.data.success) {
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return []
  }

  getExcel = async (baseUrl: any, formName: string, params: object): Promise<any> => {
    try {
      return await axios.get<OperationResult<any>>(`flow/form/excel/${formName}`, {
        responseType: "blob",
        baseURL: baseUrl,
        params
      })

    } catch (e) {
      console.log(e.response)
    }
    return []
  }


  getForm = async (baseUrl: string, formName: string, id: number): Promise<object> => {
    try {
      const res = await axios.get<OperationResult<object>>(`flow/form/read/${formName}`, {
        baseURL: baseUrl,
        params: {id}
      })
      if (res.data.success) {
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return {}
  }

  submitForm = async (baseUrl: string, formName: string, data: object): Promise<number> => {
    try {
      const res: any = await axios.post<OperationResult<number>>(`flow/form/submit/${formName}`, data, {
        baseURL: baseUrl,
        // @ts-ignore
        noNotify: true
      })
      if (res.data.success) {
        return res.data.result
      } else {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return 0
  }

  deleteForm = async (baseUrl: any, formLeadId: number): Promise<boolean> => {
    try {
      const res: any = await axios.delete<OperationResult<boolean>>(`flow/formLead/${formLeadId}`, {
        baseURL: baseUrl
      })
      if (!res.data.success) {
        console.log(res.data.error)
      }
    } catch (e) {
      console.log(e.response)
    }
    return false
  }
}

//#endregion Form

//#region Identity

interface ILoginResult {
  accessToken: string
  refreshToken: string
  tenants: Array<ITenant>
  claims: Array<any>
  permissions: any
}

export interface IUserClaims {
  amr: string;
  aud: string;
  auth_time: string;
  branch_id: string;
  client_id: string;
  email: string;
  email_verified: string;
  exp: string;
  family_name: string;
  given_name: string;
  iat: string;
  idp: string;
  iss: string;
  nbf: string;
  phone_number: string;
  phone_number_verified: string;
  role: string;
  scope: string[];
  sub: string;
  tenant_id: string;
  tenant_url: string;
  username: string;
}

export interface ITenant {
  id: number;
  title: string;
  branchId: number;
  branchTitle: string;
  userId: number;
  baseUrls: any;
  isDefault: boolean;
  roleCount: number;
  logo: any;
}


export interface ITenantInfo {
  title: string;
  officialTitle: string;
  logo: string;
}

class Account {
  baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  login = (username: string, password: string) => {
    return axios.post<OperationResult<ILoginResult>>('account/token', {
      username,
      password,
      type: 1,
      userType: 0
    }, {baseURL: this.baseUrl, errorMessage: 'نام کاربری یا رمز عبور معتبر نمی باشد', noNotifySuccess: true} as any)
  }

  getSwitchTenantHash = (tenantId: number, branchId: number) => {

    return axios.post<OperationResult<string>>('account/GenerateHash', {tenantId, branchId},
      {
        baseURL: this.baseUrl,
        // @ts-ignore
        noNotify: true
      }
    )
  }

  loginByHash = (hashToken: string) => {
    return axios.post<OperationResult<ILoginResult>>('account/token', {
      type: 0,
      userType: 0,
      hash: hashToken
    }, {baseURL: this.baseUrl, noNotify: true} as any)
  }
  changePassword = (password: string, newPassword: string) => {
    return axios.post<OperationResult<any>>('account/changePassword',
      {password, newPassword}, {baseURL: this.baseUrl, noNotify: true} as any)
  }
  userInfo = () => {
    return axios.get<OperationResult<any>>('user/info', {baseURL: this.baseUrl})
  }
  //logout = () => axios.get<IResponse<any>>('account/logout', {baseURL: this.baseUrl})
}

class Tenant {
  baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  tenantInfo = () => {
    return axios.post<IResponse<any>>(`${this.baseUrl}/tenant/getTenantInfoWithUrl`, null, {noNotify: true} as any)
  }

}

export class IdentityApi {
  baseUrl: string
  account: Account
  tenant: Tenant
  userPermission: any

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.account = new Account(baseUrl)
    this.tenant = new Tenant(baseUrl)
    this.userPermission = {
      getUserPermissions: () =>
        axios.get<OperationResult<any>>(`${this.baseUrl}/User/My/Permissions`, {noNotify: true} as any)
    }
  }
}

//#endregion Identity

//#region Menu

export interface IMenu {
  id: number;
  name: string;
  title: string;
  parentId: number | null;
  index: number;
  link: null | string;
  icon: string;
  colorHex: string;
  children: IMenu[];
}

class Menu {
  baseUrl: string

  constructor(baseURL: string) {
    this.baseUrl = baseURL
  }


  get = () =>
    axios.get<OperationResult<IMenu[]>>('menu/user',
      // @ts-ignore
      {baseURL: this.baseUrl, noNotify: true})
}

//#endregion Menu


export class Api {
  service = new ServiceList(process.env.API_URL + '/core' ?? '');
  form = new FormList(process.env.API_URL + '/flow' ?? '');
  menu = new Menu(process.env.API_URL + '/core' ?? '');
  serviceProvider = new ServiceProvider();
  formProvider = new FormProvider();
  // base = new BaseApi(process.env.BASE_URL ?? '');
  // hotel = new HotelApi(process.env.HOTEL_URL ?? '');
  identity = new IdentityApi(process.env.API_URL + '/identity' ?? '');
}

export const api = new Api()
export default boot(({Vue, app}) => {
  Vue.prototype.$api = api
})


