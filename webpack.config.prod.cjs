const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { ProvidePlugin } = require("webpack");

module.exports = {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  entry: {
    "bundle": "./app/prod.ts",
    __less: "./public/style/main.less",
    //"firebase-messaging-sw": "./service-worker/firebase-messaging-sw.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, {
          loader: "css-loader",
          options: {
            url: false,
          },
        }, "less-loader"],
      },
      {
        test: /\.ya?ml$/,
        use: "yaml-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".less"],
    extensionAlias: {
      ".js": [".js", ".ts"],
    },
    fallback: {
      url: require.resolve("url/"),
      os: require.resolve("os-browserify/browser"),
      http: require.resolve("http-browserify"),
      https: require.resolve("https-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert/"),
      crypto: require.resolve("crypto-browserify"),
      util: require.resolve("util/"),
      buffer: require.resolve("buffer/"),
      "process/browser": require.resolve("process/browser"),
    },
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public"),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "bundle.css",
    }),
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
  ],
};
