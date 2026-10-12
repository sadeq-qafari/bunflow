import {ActionTree} from 'vuex'
import {StateInterface} from './state'
import {api, IMenu} from 'boot/api'
import {SetBearerToken} from "boot/axios";
import axios from "axios";

function setParentForChildren(item: any) {
  for (let x of item.children || []) {
    x.parent = item
    setParentForChildren(x)
  }
}


function getJsFunction(model: any, propertyName: string) {
  if (model[propertyName] == null || model[propertyName].trim().length <= 0) {
    return null
  }
  try {
    const fn = eval(model[propertyName])
    if (typeof fn !== 'function') return null
    return fn
  } catch {
    return null
  }
}

function prepareJsFunctions(model: any) {
  model.inputMapperFn = getJsFunction(model, 'jsInputMapper')
  model.outputMapperFn = getJsFunction(model, 'jsOutputMapper')
  model.controllerFn = getJsFunction(model, 'jsController')
}

const actions: ActionTree<StateInterface, StateInterface> = {
  async login(ctx, {username, password}) {
    try {
      const res = await api.identity.account.login(username, password);
      if (res.data.success) {
        SetBearerToken(res.data.result.accessToken)
        localStorage.setItem('accessToken', res.data.result.accessToken)
        localStorage.setItem('refreshToken', res.data.result.refreshToken)
        ctx.commit('setUser', res.data.result.claims)
        localStorage.setItem('userInfo', JSON.stringify(res.data.result.claims))
        ctx.commit('setPermissions', res.data.result.permissions)
        ctx.commit('setTenants', res.data.result.tenants)
        await ctx.dispatch('loadMenus')
        await ctx.dispatch('loadTenantInfo')
        await ctx.dispatch('loadServices')
        if (process.env.FLOW_STANDALONE) await ctx.dispatch('loadForms')
        return {success: true, error: null, tenants: res.data.result.tenants}
      } else {
        return {success: false, error: res.data.error}
      }
    } catch (e) {
      return {success: false, error: e.response.message}
    }
  },
  async loginByHash(ctx, hashToken) {
    try {
      const res = await api.identity.account.loginByHash(hashToken);
      if (res.data.success) {
        SetBearerToken(res.data.result.accessToken)
        localStorage.setItem('accessToken', res.data.result.accessToken)
        localStorage.setItem('refreshToken', res.data.result.refreshToken)
        ctx.commit('setUser', res.data.result.claims)
        localStorage.setItem('userInfo', JSON.stringify(res.data.result.claims))
        ctx.commit('setPermissions', res.data.result.permissions)
        localStorage.removeItem('services')
        ctx.commit('setTenants', res.data.result.tenants)
        ctx.dispatch('loadServices')
        ctx.dispatch('loadMenus')
        ctx.dispatch('loadTenantInfo')
        return {success: true, error: null}
      } else {
        return {success: false, error: res.data.error}
      }
    } catch (e) {
      return {success: false, error: e.response.message}
    }
  },
  async tryLogin(ctx) {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken == null) return false
      SetBearerToken(accessToken)
      if (!ctx.state.user) {
        let claims = await axios.get('user/info', {baseURL: process.env.API_URL + '/identity'})
        ctx.commit('setUser', claims.data.result.claims)
        ctx.commit('setPermissions', claims.data.result.permissions)
        localStorage.setItem('userInfo', JSON.stringify(claims.data.result.claims))
      }
      ctx.dispatch('loadMenus')
      if (!ctx.state.tenant)
        ctx.dispatch('loadTenantInfo')
      if (!ctx.state.tenants || ctx.state.tenants.length <= 0)
        ctx.dispatch('loadTenants')
      if (process.env.FLOW_STANDALONE) {
        await ctx.dispatch('loadServices')
        await ctx.dispatch('loadForms')
      }
      return true
    } catch (e) {
      return false
    }
  },
  async tryRefreshToken(ctx) {
    try {
      if (localStorage.getItem('refreshToken')) {
        const res = await axios.post('account/token', {
          refreshToken: localStorage.getItem('refreshToken'),
          type: 3,
          userType: 0,
          // @ts-ignore
        }, {baseURL: process.env.API_URL + '/identity', noNotify: true})
        localStorage.setItem('accessToken', res.data.result.accessToken)
        localStorage.setItem('refreshToken', res.data.result.refreshToken)
        SetBearerToken(res.data.result.accessToken)
        return true
      } else {
        return false
      }
    } catch (e) {
      await ctx.dispatch('logout')
      return false
    }
  },
  async logout(ctx) {
    localStorage.clear()
    ctx.commit('logout')
    return true
  },
  async loadServices(ctx) {
    const saanaaServices = await api.service.get()

    let services = []
    for (const service of saanaaServices) {
      for (const m of service?.models) {
        prepareJsFunctions(m)
        for (const p of m.properties) {
          if (p.relatedModelPropertyId != null) {
            p.relatedModelProperty = m.properties.find((x: any) => x.id === p.relatedModelPropertyId)
          }
        }
      }
      services.push(service)
    }
    ctx.commit('setServices', services)
  },
  async loadForms(ctx) {
    const saanaaForms = await api.form.get()
    ctx.commit('setForms', saanaaForms)
  },
  async loadMenus(ctx) {
    let menus: IMenu[] = []
    if (ctx.state.user != null) {
      const res = await api.menu.get()
      // @ts-ignore
      menus = res.data?.result
      for (let item of menus) {
        (item as any).parent = null
        setParentForChildren(item)
      }
      ctx.commit('setMenu', menus)
    }
  },
  async loadTenantInfo(ctx) {
    // @ts-ignore
    const res = await axios.get(`${process.env.API_URL}/Tenant/Organization/Info`, {noNotify: true})
    if (res.data.success) {
      ctx.commit('setTenantInfo', res.data.result)
    }
  },
  async loadTenants(ctx) {
    // @ts-ignore
    const res = await axios.get(`${process.env.API_URL}/Identity/TenantUser/tenants`, {noNotify: true})
    if (res.data.success) {
      ctx.commit('setTenants', res.data.result)
    }
  },

  load: async function (ctx) {
      await ctx.dispatch('loadServices')
      await ctx.dispatch('loadForms')
  }
}

export default actions

