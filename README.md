# Starter build for projects using Gulp

This project is a starter build for all projects that use Gulp to automate tasks.

## Deployment instructions

1. Clone the repository.
2. Run the `npm install` command to install dependencies.
3. Start the project using the `gulp` command.
4. Open your browser and go to `http://localhost:3000`.

## Script commands

- `gulp`: runs the project in development mode.
- `gulp build`: builds the project for production.
- `gulp fonts`: converts fonts from the app/fonts/src folder to .woff, .woff2 formats.

## Contribution guidelines

### HTML files

- Changes to HTML content should only be made in files located in the `pages` folder.
- Do not edit HTML files located in the root directory or in other project folders that do not contain `pages` in their path.
- All files can be organized into subfolders within `pages` as needed.

### Components

- To insert a component into a page, use the syntax `<!-- =include example.html -->`, where example.html is the name of the file located in the app/components/ folder.
- Subfolders inside `components` can be used as needed.

### JS files

- Changes to JS content should only be made in files located in the `js/src` folder.
- By default, all files are combined into a single file `script.min.js`. If separate minified files are needed, in gulp in the `scripts()` function you should comment out `.pipe(concat("script.min.js"))` and uncomment `.pipe(rename({ suffix: ".min" }))`.

### LESS files

- By default, LESS files are not combined into a single file `style.min.css`. Each file is minified and added to the `css` folder. If you need LESS files to be combined into one file, in gulp in the `styles()` function you should uncomment `.pipe(concat("style.min.css"))` and comment out `.pipe(rename({ suffix: ".min" }))`.
- There is a separate function in libs.less

### Images

- Images for the project should be added to the `images/src` folder.
- All files can be organized into subfolders within `images/src` as needed.

### Fonts

- Fonts for the project should be added to the `fonts/src` folder.
- Fonts must be added in .ttf format

## Build functionality description

Brief description of each function:

- pages(): copies HTML page files from the `app/pages/` folder and inserts required components from the `app/components/` folder. To insert a file from components, a special syntax `<!--=include example.html -->` is used, where example.html is the name of the file located in the app/components/ folder.  
  Automatically corrects image paths in HTML files after moving pages within the `app/` folder.  
  Preserves folder hierarchy when moving files from app/pages/ to app/.

- fonts(): converts fonts from `.ttf` format to `.woff` and `.woff2` formats and saves them to the `app/fonts/` folder. The .eot format is simply copied to the app/fonts/ folder. Other font formats are not converted.

- images(): takes images from the `app/images/src` folder, optimizes and converts them from .png, .jpg, .jpeg formats into .avif, .webp, .jpeg and .png formats. Saves the result to the `app/images/` folder, preserving folder hierarchy.

- scripts(): combines and minifies JavaScript files and saves the result as script.min.js in the `app/js/` folder, or can be configured to output separate files.

- styles(): compiles LESS files, adds vendor prefixes and minifies CSS, saving the result as style.min.css in the `app/css/` folder, or can be configured to output separate files.

- watching(): starts a local server and watches for changes in LESS, images, JavaScript and HTML files for automatic browser reload.

- cleanDist(): deletes the dist folder before each build run to clean previous results.

- building(): builds the final project for release, copies necessary files to the dist folder, excluding files and folders that are not needed in the final build.
