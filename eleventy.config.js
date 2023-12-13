require('dotenv').config();
const { execSync } = require('child_process');
const lodash = require('lodash');
const slugify = require('slugify');
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
const Image = require('@11ty/eleventy-img');
const img2picture = require("eleventy-plugin-img2picture");
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
async function remoteImages() {

    let imageBuffer = await EleventyFetch(url, {
      duration: "1w",
      type: "buffer",
      directory: ".cache",
      removeUrlQueryParams: false,
    });
		formats: ["webp", "jpeg"],

    console.log( imageBuffer );
}

// 	------ Get all unique key values from a collection -----------
function getAllKeyValues(collectionArray, key) {
  // get all values from collection
  let allValues = collectionArray.map((item) => {
    let values = item.data[key] ? item.data[key] : [];
    return values;
  });

  // flatten values array
  allValues = lodash.flattenDeep(allValues);
  // to lowercase
  allValues = allValues.map((item) => item.toLowerCase());
  // remove duplicates
  allValues = [...new Set(allValues)];
  // order alphabetically
  allValues = allValues.sort(function (a, b) {
    return a.localeCompare(b, "en", {
      sensitivity: "base"
    });
  });
  // return
  return allValues;
}

// 	------ Converts the given string to a slug form -----------
function strToSlug(str) {
  const options = {
    replacement: "-",
    remove: /[&,+()$~%.'":*?<>{}]/g,
    lower: true,
  };

  return slugify(str, options);
}


module.exports = function (config) {

  // -------------------- Pathfind Process -----------------------
  config.on('eleventy.after', async () => {
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
  config.setLibrary("md", markdownLibrary);
  config.amendLibrary("md", mdLib => mdLib.use(markdownItAnchor, [{
    slugify: slugifyString,
    tabIndex: false,
    permalink: markdownItAnchor.permalink.headerLink({
      class: 'heading--anchor'
    })
  }]));
  config.amendLibrary("md", mdLib => mdLib.use(markdownItLinkAttributes, [{
    matcher(href) {
      return href.match(/^https?:\/\//);
    },
    attrs: {
      target: '_blank',
      rel: 'noopener'
    }
  }]));
  config.amendLibrary("md", mdLib => mdLib.use(markdownitAbbr));
  config.addFilter("toHTML", str => {
    return new markdownIt(markdown_options).renderInline(str);
  });
  config.addPlugin(pluginRss);
  config.addPlugin(wordStats);
  config.addPlugin(svgSprite, {
    path: "./src/assets/icons",
    globalClasses: "icon",
  });
	config.addPlugin(eleventySass, {
    compileOptions: {
      cache: false
    },
    postcss: postcss([cssnano, autoprefixer])
	});
  config.addPlugin(generateSocialImages, {
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
  if (process.env.ELEVENTY_ENV === "production") {
    config.addPlugin(img2picture, {
      eleventyInputDir: 'src',
      imagesOutputDir: "_site/assets/images",
      urlPath: "/assets/images",
      extensions: ["jpg", "png", "jpeg"],
      formats :["avif", "webp", "jpeg"],
      minWidth: 300,
      maxWidth: 1500,
      widthStep: 300,
    });
    } else {
      config.addPassthroughCopy("/assets/images");
    };

  // 	--------------------- Filters ---------------------
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName])
  });

  // 	--------------------- Transforms ---------------------
  Object.keys(transforms).forEach((transformName) => {
    config.addTransform(transformName, transforms[transformName])
  });

  // 	--------------------- Shortcodes ---------------------
  Object.keys(shortcodes).forEach((shortcodeName) => {
    config.addShortcode(shortcodeName, shortcodes[shortcodeName])
  });

  // 	------------------- Image Shortcodes ---------------------
  config.addNunjucksAsyncShortcode("image", imageShortcode);
  config.addLiquidShortcode("image", imageShortcode);
  config.addJavaScriptFunction("image", imageShortcode);

  // 	--------------------- layout aliases -----------------------
  config.addLayoutAlias('base', 'base.njk');
  config.addLayoutAlias('feed', 'feed.njk');
  config.addLayoutAlias('post', 'post.njk');
  config.addLayoutAlias('product', 'product.njk');

  // 	--------------------- Custom Watch Targets -----------------------
  config.addWatchTarget('./src/assets');
  config.addWatchTarget('./src/data');

  // 	--------------------- Passthrough File Copy -----------------------
  config.addPassthroughCopy('src/assets/css');
  config.addPassthroughCopy('src/assets/fonts');
  config.addPassthroughCopy('src/assets/images');
  config.addPassthroughCopy('src/assets/icons');
  config.addPassthroughCopy('src/robots.txt');
  config.addPassthroughCopy('src/.htaccess');
  config.addPassthroughCopy('src/site.webmanifest');
  config.addPassthroughCopy('src/android-chrome-192x192.png');
  config.addPassthroughCopy('src/android-chrome-512x512.png');
  config.addPassthroughCopy('src/apple-touch-icon.png');
  config.addPassthroughCopy('src/browserconfig.xml');
  config.addPassthroughCopy('src/favicon.ico');
  config.addPassthroughCopy('src/icon.svg');
  config.addPassthroughCopy('src/mstile-150x150.png');

  // 	--------------------- Deep-Merge -----------------------
  config.setDataDeepMerge(true);

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