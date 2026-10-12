export const services = [
  {
    id: 1,
    name: "flow",
    title: "مدیریت داده",
    baseUrl: "",
    models: [
      model(
        1,
        "form",
        "فرم‌ها",
        ["id", "name", "title", "description", "isActive"],
        true
      ),
      model(
        2,
        "lookup",
        "لیست‌ها",
        ["id", "title", "description", "typeLookup"],
        true
      ),
    ],
  },
];
function model(
  id: number,
  name: string,
  title: string,
  fields: string[],
  custom: boolean
) {
  return {
    id,
    name,
    title,
    hasCustomUpsertForm: custom,
    insert: true,
    read: true,
    update: true,
    delete: true,
    isActive: true,
    isReport: false,
    filters: [],
    relatedModels: [],
    properties: fields.map((field, i) => ({
      id: id * 100 + i,
      name: field,
      title:
        (
          {
            id: "شناسه",
            name: "نام",
            title: "عنوان",
            description: "توضیحات",
            isActive: "فعال",
            typeLookup: "نوع",
          } as any
        )[field] || field,
      type:
        field === "id" || field === "typeLookup"
          ? "int"
          : field === "isActive"
          ? "bool"
          : "string",
      visible: true,
      insertable: false,
      updatable: false,
      filterable: true,
      isLtr: field === "name",
      dataGrid: { visible: true },
      element: null,
    })),
  };
}
export const menus = [
  {
    id: 1,
    name: "flow",
    title: "مدیریت داده",
    index: 0,
    icon: "storage",
    colorHex: "06b6d4",
    parentId: null,
    link: null,
    isActive: true,
    children: [
      {
        id: 2,
        name: "form",
        title: "فرم‌ها",
        index: 0,
        icon: "dynamic_form",
        colorHex: "06b6d4",
        parentId: 1,
        link: "flow/form",
        isActive: true,
        children: [],
      },
      {
        id: 3,
        name: "lookup",
        title: "لیست‌ها",
        index: 1,
        icon: "list",
        colorHex: "06b6d4",
        parentId: 1,
        link: "flow/lookup",
        isActive: true,
        children: [],
      },
    ],
  },
];
