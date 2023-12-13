const lodash = require('lodash');
const slugify = require('slugify');
const {slugifyString} = require('./utils/index.js');
const filters = require('./utils/filters.js');
const transforms = require('./utils/transforms.js');
const shortcodes = require('./utils/shortcodes.js');
const markdownIt = require('markdown-it');
const markdownItLinkAttributes = require('markdown-it-link-attributes');
const markdownitAbbr = require('markdown-it-abbr');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const wordStats = require('@photogabble/eleventy-plugin-word-stats');
const generateSocialImages = require("@fat-buddha-designs/eleventy-social-images");
const Image = require('@11ty/eleventy-img');

// 	--------------- Hide Future Items -----------------
const hideFutureItems = (post) => {
  let now = new Date().getTime();
  if (now < post.date.getTime()) return false;
  return true;
}

// 	--------------- Hide Past Items -----------------
const hidePastItems = (post) => {
  let now = new Date().getTime();
  if (now > post.date.getTime()) return false;
  return true;
}

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

  // 	--------------------- Markdown ---------------------
  const markdown_options = {
    html: true,
    breaks: false,
    linkify: true,
    typographer: true
  };
  let markdownLibrary = markdownIt(markdown_options);
  config.setLibrary("md", markdownLibrary);
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

  // 	--------------------- Plugins ---------------------
  config.addPlugin(pluginRss);
  config.addPlugin(wordStats);
  config.addPlugin(generateSocialImages, {
    promoImage: "./src/assets/images/QRcode.png",
    outputDir: "./_site/socialImages",
    urlPath: "/socialImages",
    siteUrl: "Website ~ https://planttheatresandmore.co.uk",
    siteEmail: "Email ~ info@planttheatresandmore.co.uk",
    titleColor: "#ffffff",
    bgColor: "#ffffff",
    terminalBgColor: "#3b0066",
    lineBreakAt: "48"
  });

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

  // 	--------------------- Collections ---------------------
  // Returns a collection of events
  config.addCollection("events", function (collectionApi) {
    return collectionApi.getFilteredByGlob('./src/content/events/*.md').filter(hidePastItems)
  });

  config.addCollection("products", (collection) => {
    return collection.getFilteredByGlob('./src/content/products/**/*.md')
  });

  config.addCollection("featuredProducts", collection => {
    return collection.getFilteredByGlob('./src/content/products/**/*.md').filter(product => product.data.featuredProduct)
  });

  // Blogposts collection
  config.addCollection("releasedPosts", function (collectionApi) {
    return collectionApi.getFilteredByGlob('./src/content/posts/*.md').reverse().filter(hideFutureItems)
  });

  // create blog categories collection
  config.addCollection("categories", function (collection) {
    let allCategories = getAllKeyValues(
      collection.getFilteredByGlob('./src/content/posts/*.md'),
      "categories"
    );

    let categories = allCategories.map((category) => ({
      title: category,
      slug: strToSlug(category),
    }));

    return categories;
  });

  // 	------------------- Image Shortcodes ---------------------
  config.addNunjucksAsyncShortcode("image", imageShortcode);
  config.addLiquidShortcode("image", imageShortcode);
  config.addJavaScriptFunction("image", imageShortcode);

  // 	--------------------- layout aliases -----------------------
  config.addLayoutAlias('base', 'base.njk')
  config.addLayoutAlias('feed', 'feed.njk')
  config.addLayoutAlias('post', 'post.njk')

  // 	--------------------- Custom Watch Targets -----------------------
  config.addWatchTarget('./src/assets');

  // 	--------------------- Passthrough File Copy -----------------------
  config.addPassthroughCopy('src/assets/css')
  config.addPassthroughCopy('src/assets/fonts')
  config.addPassthroughCopy('src/assets/images')
  config.addPassthroughCopy('src/assets/icons')
  config.addPassthroughCopy('src/assets/products')
  config.addPassthroughCopy('src/robots.txt')
  config.addPassthroughCopy('src/.htaccess')
  config.addPassthroughCopy('src/site.webmanifest')
  config.addPassthroughCopy('src/favicon-16x16.png')
  config.addPassthroughCopy('src/favicon-32x32.png')
  config.addPassthroughCopy('src/browserconfig.xml')
  config.addPassthroughCopy('src/android-chrome-192x192.png')
  config.addPassthroughCopy('src/android-chrome-512x512.png')
  config.addPassthroughCopy('src/apple-touch-icon.png')

  // 	--------------------- Deep-Merge -----------------------
  config.setDataDeepMerge(true);

  // 	--------------------- Base Config -----------------------
  return {
    templateFormats: ['html', 'liquid', 'njk', 'md', 'ico', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      layouts: 'layouts',
      data: '_data'
    },
  };
};