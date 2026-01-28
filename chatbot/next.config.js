const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

module.exports = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'chatbot',
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
          './ChatbotWidget': './components/ChatbotWidget',
          },
          shared: {}, 
        })
      )
    }

    return config
  },
}
