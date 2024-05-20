require('dotenv').config();
const { execSync } = require('child_process');
const {slugifyString} = require('./config/utils/index.js');
const filters = require('./config/utils/filters.js');
const transforms = require('./config/utils/transforms.js');
const shortcodes = require('./config/utils/shortcodes.js');
const site = require('./site.config.js');
const eleventySass = require('eleventy-sass');
const postcss = require("postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const wordStats = require('@photogabble/eleventy-plugin-word-stats');
const markdownIt = require('markdown-it');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const Image = require('@11ty/eleventy-img');
const generateSocialImages = require("@fat-buddha-designs/eleventy-social-images");
const svgSprite = require("eleventy-plugin-svg-sprite");

// 	------------- Image Manipulation ----------------
async function imageShortcode(src, alt, classes, sizes = '100vw', loading) {
  if (alt === undefined) {
    throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
  }

  let metadata = await Image(src, {
    widths: [300, 600, 1220, 2440],
    formats: ['webp', 'jpeg'],
    urlPath: '/assets/images/',
    outputDir: './_site/assets/images/'
  });''

  let lowsrc = metadata.jpeg[0];
  let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

  return `<picture class="${classes}">
  ${Object.values(metadata)
    .map(imageFormat => {
      return `<source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(', ')}" sizes="${sizes}" loading="${loading}">`;
    })
    .join('\n')}
    <img
      loading="${loading}"
      src="${lowsrc.url}"
      width="${highsrc.width}"
      height="${highsrc.height}"
      class="${classes}"
      alt="${alt}"
      decoding="async">
  </picture>`;
}

module.exports = function (eleventyConfig) {

  // ----------------- Global Data -----------------
  eleventyConfig.addGlobalData('site', site);

  // --------------- Pathfind Process -----------------
  eleventyConfig.on('eleventy.after', async () => {
    execSync(`npx pagefind --site _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
  });

  // 	------------------- Markdown ---------------------
  const markdown_options = {
    html: true,
    breaks: false,
    linkify: true,
    typographer: true
  };
  let markdownLibrary = markdownIt(markdown_options);
  eleventyConfig.setLibrary("md", markdownLibrary);
  eleventyConfig.addFilter("toHTML", str => {
    return new markdownIt(markdown_options).render(str);
  });

  // 	---------------- Plugins ---------------------
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(wordStats);
  eleventyConfig.addPlugin(svgSprite, {
    path: "./src/assets/icons",
    globalClasses: "icon",
  });
	eleventyConfig.addPlugin(eleventySass, {
    compileOptions: {
      cache: false
    },
    postcss: postcss([cssnano, autoprefixer])
	});
  eleventyConfig.addPlugin(generateSocialImages, {
    promoImage: "./src/assets/images/QRcode.png",
    outputDir: "./_site/socialImages",
    urlPath: "/socialImages",
    siteUrl: "Website ~ https://planttheatresandmore.co.uk",
    siteEmail: "Email ~ info@planttheatresandmore.co.uk",
    titleColor: "#fff",
    bgColor: "#fff",
    terminalBgColor: "#607622",
    lineBreakAt: "48"
  });

  // 	--------------------- Filters ---------------------
  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addFilter(filterName, filters[filterName])
  });

  // 	--------------------- Transforms ---------------------
  Object.keys(transforms).forEach((transformName) => {
    eleventyConfig.addTransform(transformName, transforms[transformName])
  });

  // 	--------------------- Shortcodes ---------------------
  Object.keys(shortcodes).forEach((shortcodeName) => {
    eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName])
  });

  // 	------------------- Image Shortcodes ---------------------
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  // 	--------------------- layout aliases -----------------------
  eleventyConfig.addLayoutAlias('base', 'base.njk');
  eleventyConfig.addLayoutAlias('feed', 'feed.njk');
  eleventyConfig.addLayoutAlias('post', 'post.njk');
  eleventyConfig.addLayoutAlias('product', 'product.njk');

  // 	-------------- Custom Watch Targets ------------------
  eleventyConfig.addWatchTarget('./src/assets');
  eleventyConfig.addWatchTarget('./src/data');

  // 	--------------------- Passthrough File Copy -----------------------
  eleventyConfig.addPassthroughCopy('src/assets/css');
  eleventyConfig.addPassthroughCopy('src/assets/fonts');
  eleventyConfig.addPassthroughCopy('src/assets/images');
  eleventyConfig.addPassthroughCopy('src/assets/icons');
  eleventyConfig.addPassthroughCopy('src/assets/scripts/vendor');
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/.htaccess');
  eleventyConfig.addPassthroughCopy('src/site.webmanifest');
  eleventyConfig.addPassthroughCopy('src/android-chrome-192x192.png');
  eleventyConfig.addPassthroughCopy('src/android-chrome-512x512.png');
  eleventyConfig.addPassthroughCopy('src/maskable-icon.png');
  eleventyConfig.addPassthroughCopy('src/apple-touch-icon.png');
  eleventyConfig.addPassthroughCopy('src/browserconfig.xml');
  eleventyConfig.addPassthroughCopy('src/favicon.ico');
  eleventyConfig.addPassthroughCopy('src/icon.svg');
  eleventyConfig.addPassthroughCopy('src/mstile-150x150.png');

  // 	--------------------- Deep-Merge -----------------------
  eleventyConfig.setDataDeepMerge(true);

  // 	--------------------- Base Config -----------------------
  return {
    pathPrefix: "/",
    templateFormats: ['njk', 'md', 'ico', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      layouts: 'layouts',
      data: '_data'
    },
  };
}