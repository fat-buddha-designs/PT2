// @ts-check
require("dotenv").config();

const Airtable = require("airtable");
const { AssetCache } = require("@11ty/eleventy-fetch");
const airtableTable = "Products";
const airtableTableView = "All";
const Image = require("@11ty/eleventy-img");

const IMAGES_URL_PATH = "/assets/images/";
const IMAGES_OUTPUT_DIR = `./_site${IMAGES_URL_PATH}`;

// I'm setting the cache to 2 hours to match with
// Airtable attachments URL expiry
// See FAQs on https://support.airtable.com/docs/airtable-attachment-url-behavior.
const CACHE_DURATION = "2h";

// Get API Key/Personal from environment
// For development, open .env.dev file
// and uncomment the first line
// const apiKey = process.env.AIRTABLE_API_KEY;

async function getProductsData() {
  // Initialize Airtable API instance
  const base = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN }).base(process.env.AIRTABLE_BASE_TOKEN);
  let records = [];
  try {
    // Get all the records from a view.
    // This is easier than getting data page wise
    records = await base(airtableTable)
      .select({
      view: airtableTableView,
      filterByFormula: 'FIND("InStock",{stock})>0',
      sort: [{ field: "Title", direction: "asc" }],
    })
      .all();
  } catch (e) {
    // Show error and return empty array on failures
    console.error(e);
    return [];
  }

  // Get only fields
  let fields = records.map((r) => {
    return r.fields;
  });

  // Pick URLs from image object array
  // I'm picking the URL to the full image, as this will be post processed
  // through Eleventy Image later in the pipeline
  fields = fields.map((f) => {
    const images = f.image;
    return {
      ...f,
      image: images?.map((p) => p?.url),
    };
  });

  // Remove entries with no title
  fields = fields.filter((f) => Boolean(f.Title));

  return fields;
}

async function processRemoteImages(products) {
  // Using Promise.all to wait until all product objects
  // are processed.
  return Promise.all(
    products.map(async (p) => {
      // Picking the first photo from the array
      const url = p.image[0];

      const metadata = await Image(url, {
        widths: [800, 600, 400],
        urlPath: IMAGES_URL_PATH,
        outputDir: IMAGES_OUTPUT_DIR,
        formats: ["webp", "jpeg"],
        cacheOptions: {
          duration: CACHE_DURATION,
        },
      });

      const pictureElement = Image.generateHTML(metadata, {
        alt: `Thumbnail for ${p.Title}`,
        id: `mainImage`,
        class: `mainImage`,

        // Once, you finalise the design of the page,
        // Use https://ausi.github.io/respimagelint/
        // to determine optimum 'sizes' attribute
        sizes: "100w",
      });

      // This is to remove 'image' properties
      // from the object without mutating
      const { image, ...restOfProduct } = p;

      return {
        ...restOfProduct,
        pictureElement,
      };
    }),
  );
}

module.exports = async function () {
  const productsCache = new AssetCache("airtable-products");

  if (productsCache.isCacheValid(CACHE_DURATION)) {
    return productsCache.getCachedValue(); // This returns a promise
  }

  console.log("Cache expired. Fetching data from Airtable");

  let products = await getProductsData();

  products = await processRemoteImages(products);

  await productsCache.save(products, "json");

  return products;
};