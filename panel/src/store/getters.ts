import {GetterTree} from 'vuex'
import {StateInterface} from './state'
import {IService} from "boot/api";

const getters: GetterTree<StateInterface, StateInterface> = {
  hasPermission(state) {
    return (permissionName: string) => {
      const parts = permissionName && permissionName.toLowerCase().split('.') as string[]
      if (!parts) return false
      if (parts.length == 1) return state.permissions[parts[0] as any]
      if (parts.length == 2) return state.permissions[parts[0] as any]
        && state.permissions[parts[0] as any][parts[1] as any]
      if (parts.length == 3) return state.permissions[parts[0] as any]
        && state.permissions[parts[0] as any][parts[1] as any]
        && state.permissions[parts[0] as any][parts[1] as any].indexOf(parts[2]) >= 0
      return false
    }
  },
  getService(state) {
    return (serviceName: string) => {
      return state.services.find((x: any) => x.name.toLowerCase() == serviceName.toLowerCase())
    }
  },
  getServiceModel(state) {
    return (serviceName: string, modelName: string) => {
      const service = state.services.find((x: any) => x.name.toLowerCase() == serviceName.toLowerCase())
      return service && service.models.find((x: any) => x.name.toLowerCase() == modelName.toLowerCase())
    }
  },
  getServiceModels(state) {
    return (serviceName: string) => {
      const service = state.services.find(x => x.name.toLowerCase() == serviceName.toLowerCase())
      return service ? service.models : []
    }
  },

  getModelProperty(state) {
    return (modelId: number, modelPropertyId: number) => {
      const service = state.services.find((x: IService) => x.models.findIndex((y: any) => y.id == modelId) >= 0)
      const model = service && service.models.find((x: any) => x.id == modelId)
      return model && model.properties.find((x: any) => x.id == modelPropertyId)
    }
  },

  getMenu(state) {
    return (parentId?: number) => {
      return state.menus.filter(x => x.parentId == parentId)
    }
  },
  getTenantInfo(state) {
    return () => {
      return state.tenant
    }
  },
  getChatProps(state) {
    return () => {
      return state.chatProps
    }
  },
//#region Form

  getForm(state) {
    return (id: number) => {
      return state.forms.find((form: any) => form.id == id)
    }
  },
  getForms(state) {
    return () => {
      return state.forms
    }
  },
  getFormByName(state) {
    return (name: string) => {
      return state.forms.find((form: any) => form.name == name)
    }
  },
  getFormProperty(state) {
    return (id: number) => {
      let form = state.forms.find((form: any) => form.properties.findIndex((x: any) => x.id == id) >= 0)
      return (form as any).properties.find((x: any) => x.id == id)
    }
  }
//#endregion Form
}

export default getters

