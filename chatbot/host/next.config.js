const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

module.exports = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          remotes: {
            chatbot: 'chatbot@http://localhost:3001/_next/static/chunks/remoteEntry.js',
          },
        })
      )
    }
    return config
  },
}
