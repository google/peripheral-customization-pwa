const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: `./src/lib/ts/manager.ts`,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.lib.json',
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'manager.js',
    path: path.resolve(__dirname, 'dist/lib'),
    clean: true,
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
};
