# Project Overview

This is a React-based personal portfolio website hosted on GitHub Pages. The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

The main purpose of this repository is to showcase personal projects. It includes a standard React application as the main entry point and separate, detailed static HTML pages for individual projects, such as `tradebot.html`.

The project uses the following main technologies:
- **React**: For building the main user interface.
- **HTML/CSS**: For static project pages.
- **Gulp**: For a custom JavaScript/JSX build process, separate from the main React app.

# Building and Running

The primary development workflow uses the scripts provided by Create React App.

## Development Server

To run the app in development mode:
```bash
npm start
```
This will open the application at [http://localhost:3000](http://localhost:3000).

## Production Build

To build the app for production:
```bash
npm run build
```
This bundles the React application into the `build` folder.

## Testing

To run the test suite:
```bash
npm test
```

## Custom Gulp Build

There is a secondary build process using Gulp, which seems to transpile JSX files from `src` to `build`. To run it:
```bash
gulp
```
*Note: This might conflict with or be extraneous to the standard `react-scripts build` command.*

# Development Conventions

- The project follows the standard structure and conventions of a Create React App.
- Main application logic is located in the `src` directory.
- Static assets and the main `index.html` are in the `public` directory.
- Standalone project pages (e.g., `tradebot.html`, `soionlab.html`) are in the root directory.
- ESLint configuration is inherited from `react-app` for code quality.
