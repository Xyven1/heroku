var merge = require('webpack-merge');
module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: config => {
    merge(config, {VUE_APP_API_KEY: process.env.APIKEY});
  }
}