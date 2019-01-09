const path = require('path');

let isDevMode = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: isDevMode ? 'development' : 'production',
    entry: {
        datagrid: ['@babel/polyfill', './app/datagrid.js'],
        'invoice-tab': ['@babel/polyfill', './app/invoice-tab.js'],
        'exception-action': ['@babel/polyfill', './app/exception-action.js']
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: isDevMode ? "source-map" : false,
    watch: isDevMode,
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,               
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: ['url-loader']
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
};