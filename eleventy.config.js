require('dotenv').config();
const { execSync } = require('child_process');
const {slugifyString} = require('./config/utils/index.js');
const filters = require('./config/utils/filters.js');
const transforms = require('./config/utils/transforms.js');
const shortcodes = require('./config/utils/shortcodes.js');
const eleventySass = require('eleventy-sass');
const postcss = require("postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const wordStats = require('@photogabble/eleventy-plugin-word-stats');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItLinkAttributes = require('markdown-it-link-attributes');
const markdownitAbbr = require('markdown-it-abbr');
const pluginRss = require('@11ty/eleventy-plugin-rss');
// const EleventyFetch  = require("@11ty/eleventy-fetch");
const Image = require('@11ty/eleventy-img');
const generateSocialImages = require("@fat-buddha-designs/eleventy-social-images");
const svgSprite = require("eleventy-plugin-svg-sprite");
const hidePastItems = (post) => {
  let now = new Date().getTime();
  if (now > post.date.getTime()) return false;
  return true;
};
const hideFutureItems = (post) => {
  let now = new Date().getTime();
  if (now < post.date.getTime()) return false;
  return true;
};

// 	--------------- Image Manipulation -----------------
async function imageShortcode(src, alt, sizes = "100vw") {
  if (alt === undefined) {
    throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
  }

  let metadata = await Image(src, {
    widths: [300, 600],
    formats: ['webp', 'jpeg'],
    urlPath: "/assets/images/",
    outputDir: "./_site/assets/images/"
  });

  let lowsrc = metadata.jpeg[0];
  let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

  return `<picture>
    ${Object.values(metadata).map(imageFormat => {
      return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
    }).join("\n")}
      <img
        src="${lowsrc.url}"
        width="${highsrc.width}"
        height="${highsrc.height}"
        alt="${alt}"
        loading="lazy"
        decoding="async">
    </picture>`;
}

// 	-----------Remote Image Manipulation -----------------
// async function remoteImagesShortcode(url, alt, sizes = "100vw") {

//   let metadata = await EleventyFetch(url, {
//     duration: "1w",
//     type: "buffer",
//     directory: ".cache",
//     removeUrlQueryParams: false,
//     widths: [300, 600, 1200],
//     formats: ['webp', 'jpeg'],
//   });

//   let lowsrc = metadata.jpeg[0];
//   let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

//   return `<picture>
//     ${Object.values(metadata).map(imageFormat => {
//       return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
//     }).join("\n")}
//       <img
//         src="${lowsrc.url}"
//         width="${highsrc.width}"
//         height="${highsrc.height}"
//         alt="${alt}"
//         loading="lazy"
//         decoding="async">
//     </picture>`;
// }

module.exports = function (eleventyConfig) {

  // -------------------- Pathfind Process -----------------------
  eleventyConfig.on('eleventy.after', async () => {
    execSync(`npx pagefind --site _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
  });

  // 	--------------------- Markdown ---------------------
  const markdown_options = {
    html: true,
    breaks: false,
    linkify: true,
    typographer: true
  };
  let markdownLibrary = markdownIt(markdown_options);
  eleventyConfig.setLibrary("md", markdownLibrary);
  eleventyConfig.amendLibrary("md", mdLib => mdLib.use(markdownItAnchor, [{
    slugify: slugifyString,
    tabIndex: false,
    permalink: markdownItAnchor.permalink.headerLink({
      class: 'heading--anchor'
    })
  }]));
  eleventyConfig.amendLibrary("md", mdLib => mdLib.use(markdownItLinkAttributes, [{
    matcher(href) {
      return href.match(/^https?:\/\//);
    },
    attrs: {
      target: '_blank',
      rel: 'noopener'
    }
  }]));
  eleventyConfig.amendLibrary("md", mdLib => mdLib.use(markdownitAbbr));
  eleventyConfig.addFilter("toHTML", str => {
    return new markdownIt(markdown_options).render(str);
  });
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

  // 	------------------- Remote Image Shortcodes ---------------------
  // eleventyConfig.addNunjucksAsyncShortcode("remoteImages", remoteImagesShortcode);
  // eleventyConfig.addLiquidShortcode("remoteImages", remoteImagesShortcode);
  // eleventyConfig.addJavaScriptFunction("remoteImages", remoteImagesShortcode);

  // 	--------------------- layout aliases -----------------------
  eleventyConfig.addLayoutAlias('base', 'base.njk');
  eleventyConfig.addLayoutAlias('feed', 'feed.njk');
  eleventyConfig.addLayoutAlias('post', 'post.njk');
  eleventyConfig.addLayoutAlias('product', 'product.njk');

  // 	--------------------- Custom Watch Targets -----------------------
  eleventyConfig.addWatchTarget('./src/assets');
  eleventyConfig.addWatchTarget('./src/data');

  // 	--------------------- Passthrough File Copy -----------------------
  eleventyConfig.addPassthroughCopy('src/assets/css');
  eleventyConfig.addPassthroughCopy('src/assets/fonts');
  eleventyConfig.addPassthroughCopy('src/assets/images');
  eleventyConfig.addPassthroughCopy('src/assets/icons');
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/.htaccess');
  eleventyConfig.addPassthroughCopy('src/site.webmanifest');
  eleventyConfig.addPassthroughCopy('src/android-chrome-192x192.png');
  eleventyConfig.addPassthroughCopy('src/android-chrome-512x512.png');
  eleventyConfig.addPassthroughCopy('src/apple-touch-icon.png');
  eleventyConfig.addPassthroughCopy('src/browsereleventyConfig.xml');
  eleventyConfig.addPassthroughCopy('src/favicon.ico');
  eleventyConfig.addPassthroughCopy('src/icon.svg');
  eleventyConfig.addPassthroughCopy('src/mstile-150x150.png');

  // 	--------------------- Deep-Merge -----------------------
  eleventyConfig.setDataDeepMerge(true);

  // 	--------------------- Base Config -----------------------
  return {
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