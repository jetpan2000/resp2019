const path = require('path');

let isDevMode = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: isDevMode ? 'development' : 'production',
    entry: {
        plants: ['@babel/polyfill', './app/plants.js'],
        bol: ['@babel/polyfill', './app/bol.js'],
        appv2: ['@babel/polyfill', './app/appv2.js'],
        'void-tab': ['@babel/polyfill', './app/void-tab.js'],
        'edit-bol-tab': ['@babel/polyfill', './app/edit-bol-tab.js']
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