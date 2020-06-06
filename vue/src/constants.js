export const models = Object.freeze({
  lists: 'lists',
  subscribers: 'subscribers',
  campaigns: 'campaigns',
  templates: 'templates',
});

export const uris = Object.freeze({
  previewCampaign: '/api/campaigns/:id/preview',
  previewTemplate: '/api/templates/:id/preview',
});

// Keys used in Vuex store.
export const storeKeys = Object.freeze({
  models: 'models',
  isLoading: 'isLoading',
});

export const timestamp = 'ddd D MMM YYYY, hh:mm A';
