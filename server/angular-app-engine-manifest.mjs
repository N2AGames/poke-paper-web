
export default {
  basePath: 'https://n2agames.github.io/poke-paper-web',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
