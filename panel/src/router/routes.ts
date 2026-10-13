import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: '/flow'
  },
  {
    path: '/dashboard',
    redirect: '/flow'
  },
  {
    path: '',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      //#region flow
      {path: '/service/flow/form/info', component: () => import('pages/flow/FormDesigner.vue')},
      {path: '/service/flow/lookup/info', component: () => import('pages/flow/LookupInfo.vue')},
      {path: '/flow', component: () => import('pages/flow/FlowDashboard.vue')},
      {path: '/flow/import/:formName', component: () => import('pages/flow/FormImport.vue')},
      {path: '/flow/:formName', component: () => import('pages/flow/GridView.vue')},
      {path: '/flow/:formName/:formLeadId', component: () => import('pages/flow/FormView.vue')},
      //#endregion flow

      //#region special pages
      {path: '/playground', component: () => import('pages/PlayGround.vue')},
      //#endregion special pages

      //#region Services
      {path: '/service/changeLog', component: () => import('pages/ChangeLog.vue')},

      {path: '/service/core/Report', component: () => import('pages/core/Report.vue')},
      {path: '/service/core/ModelProperty', component: () => import('pages/core/ModelProperty.vue')},
      {path: '/service/identity/role/info', component: () => import('pages/identity/RoleInfo.vue')},
      {
        path: '/service/identity/tenantRegisterRequest',
        component: () => import('pages/identity/TenantRegisterRequest.vue')
      },
      {path: '/service/tenant/organization/info', component: () => import('pages/tenant/OrganizationInfo.vue')},
      {path: '/service/tenant/tenantTransaction', component: () => import('pages/tenant/TenantTransaction.vue')},
      {path: '/service/:serviceName', component: () => import('pages/Service.vue')},
      {path: '/service/:serviceName/:modelName', component: () => import('pages/Model.vue')},
      //#endregion Services


    ]
  },
  {
    path: '/',
    component: () => import('layouts/RawLayout.vue'),
    children: [
      {path: 'login', name: 'login', component: () => import('pages/Login.vue')},
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:pathMatch(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes

