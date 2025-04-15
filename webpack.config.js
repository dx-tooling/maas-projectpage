const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const glob = require("glob");

// Find all HTML files in src directory and its subdirectories
const htmlFiles = glob.sync("./src/**/*.html");

// Create an HtmlWebpackPlugin instance for each HTML file found
const htmlPlugins = htmlFiles.map((file) => {
    return new HtmlWebpackPlugin({
        template: file,
        // Calculate relative path for filename based on src directory
        filename: path.relative("src", file),
    });
});

module.exports = {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
        publicPath: "auto",
    },
    plugins: [...htmlPlugins],
};
