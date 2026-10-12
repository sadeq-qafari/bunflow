import {MutationTree} from 'vuex'
import {StateInterface} from './state'
import {IForm, IMenu, IService, ITenant, ITenantInfo, IUserClaims} from "boot/api";

const mutation: MutationTree<StateInterface> = {
  setPermissions(state, payload: string[]) {
    state.permissions = payload
    // state.permissions.splice(0)
    // payload.forEach(x => state.permissions.push(x))
  },
  setServices(state, payload: IService[]) {
    state.services = payload
    // state.services.splice(0)
    // payload.forEach(x => state.services.push(x))
  },
  setForms(state, payload: IForm[]) {
    state.forms = payload
  },
  setMenu(state, payload: IMenu[]) {
    state.menus = payload
    // state.menus.splice(0)
    // payload.forEach(x => state.menus.push(x))
  },
  setTenantInfo(state, payload: ITenantInfo) {
    state.tenant = payload
  },
  setTenants(state, payload: Array<ITenant>) {
    state.tenants = payload
  },
  setUser(state, payload: IUserClaims) {
    state.user = payload
  },
  // login(state, payload: IUserInfo) {
  //   state.user = payload
  // },
  logout(state) {
    state.user = null
  },
  setChatProps(state, payload: any) {
    state.chatProps = payload
  },
  clearChatProps(state) {
    state.chatProps = null
  }
}

export default mutation

