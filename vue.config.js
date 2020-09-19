var merge = require('webpack-merge');
module.exports = {
  configureWebpack: config => {
    merge(config, {VUE_APP_API_KEY: process.env.clientid});
  },
  "transpileDependencies": [
    "vuetify"
  ]
}