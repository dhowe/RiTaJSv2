// use with browser, includes deps

module.exports = {
  mode: 'production',
  target: 'node',
  output: {
    path: require('path').resolve(__dirname, '../dist'),
    library: 'RiTa',
    filename: 'rita.js',
    globalObject: 'this',
    libraryTarget: 'umd',
  },  
  node: {
    fs: "empty",
    __dirname: false,
    __filename: false,
  },
  watchOptions: {
    ignored: /node_modules/
  },
  entry: './src/rita.js',
  plugins: [new (require('webpack').DefinePlugin)({
    __VERSION__: JSON.stringify(require("../package.json").version)
  })],
  optimization: {
    minimize: true,
    minimizer: [
        new (require('terser-webpack-plugin'))({
            //terser plugin v 2.3.8
          terserOptions: { output: { ascii_only: true } },
          extractComments: false
        })
    ],
}
};
