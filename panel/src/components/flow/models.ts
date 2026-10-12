
export interface IMenu {
  id: number
  title: string
  icon: string
  path: string | null
  color: string | null
  children: Array<IMenu>
}

export interface IFormAction {
  title: string
  color: string
  func: Function
}

export interface IForm {
  id: number
  name: string
  title: string
  serviceId: number
  serviceName: string
  isAddable: boolean
  isUpdatable: boolean
  isDeletable: boolean
  subForm?: IForm | null
  subFormRelatedFormPropertyId?: number | null
  fields: Array<IFormProperty>
}


interface IElement {
  name: string
  config?: object
}

export interface IFormProperty {

  id: number
  formId: number
  name: string
  title: string
  element: IElement
  colSize: number | 3
  index: number | 1
  isAddable: boolean | true
  isUpdatable: boolean | true
  isRequired: boolean | false
  isFilterable: boolean | false
  isHideInGrid: boolean | false
  isVisibleInDropDown: boolean
  Rules?: Array<Function> | []
  relatedForm?: number | null
  labelName?: string | null
}

