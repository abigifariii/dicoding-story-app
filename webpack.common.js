const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const WorkboxWebpackPlugin = require("workbox-webpack-plugin")

module.exports = {
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]", // Output images to 'dist/images/'
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      // Inject manifest link
      inject: "body",
      templateParameters: {
        manifestLink: '<link rel="manifest" href="/manifest.json">',
      },
    }),
    new WorkboxWebpackPlugin.GenerateSW({
      swDest: "service-worker.js",
      clientsClaim: true,
      skipWaiting: true,
      // Tambahkan atau ubah baris ini
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.origin === "https://story-api.dicoding.dev",
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 24 Hours
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ url }) =>
            url.origin === "https://fonts.googleapis.com" ||
            url.origin === "https://fonts.gstatic.com" ||
            url.origin === "https://cdnjs.cloudflare.com" ||
            url.origin === "https://unpkg.com",
          handler: "CacheFirst",
          options: {
            cacheName: "static-assets-cache",
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    }),
  ],
}
