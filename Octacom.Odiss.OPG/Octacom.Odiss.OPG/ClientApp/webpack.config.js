const path = require('path');

let isDevMode = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: isDevMode ? 'development' : 'production',
    entry: {

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
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
};