const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins:[
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./python/install"),
          to: "python",
          globOptions: {
            ignore: ["**/terminfo/**"] //  exclude conflicting files
          }
        }
        ,{
          from :path.resolve(__dirname , "./src/models"),
          to: "models",
          globOptions: {
            ignore: [ "**/.venv/**"] // exclude requirements and virtual environment
          }

        }
      ]
    })
  ]
};
