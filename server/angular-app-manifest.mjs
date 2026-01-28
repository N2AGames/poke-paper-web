
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://n2agames.github.io/poke-paper-web/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/poke-paper-web/who-is-that-poke",
    "route": "/poke-paper-web"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-NK63S2QV.js"
    ],
    "route": "/poke-paper-web/who-is-that-poke"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 983, hash: 'f72a71cd940909c8fce1c7b51f83e0a62895b6d5ab760472755e098bcf5d7796', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1120, hash: 'b55195c77748f8e0c4f54cb220b3e3fe11acf7ddef7a5d0c3825c87980b32394', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'who-is-that-poke/index.html': {size: 21537, hash: 'af8814f3d285b93549af02be3603fa311bda30e3b695b17fb6afd5af9ad2ee8d', text: () => import('./assets-chunks/who-is-that-poke_index_html.mjs').then(m => m.default)},
    'styles-MQD2XKBU.css': {size: 2170, hash: 'IdGgfmTTGfI', text: () => import('./assets-chunks/styles-MQD2XKBU_css.mjs').then(m => m.default)}
  },
};
