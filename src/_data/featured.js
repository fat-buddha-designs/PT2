require("dotenv").config();
const { AssetCache } = require("@11ty/eleventy-fetch");
const Airtable = require("airtable");
const airtableTable = "Products";
const airtableTableView = "All";
const assetCacheId = "FeaturedProducts";
var base = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN }).base(process.env.AIRTABLE_BASE_TOKEN);

module.exports = () => {
  let asset = new AssetCache(assetCacheId);

 if (asset.isCacheValid("1d")) {
    console.log("Serving airtable data from the cache…");
    return asset.getCachedValue();
  }

  return new Promise((resolve, reject) => {
    let allFeaturedProducts = [];

    base(airtableTable)
      .select({
        view: airtableTableView,
        filterByFormula: '{featuredProduct}=1',
        sort: [{ field: "Title", direction: "asc" }],
      })
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach((record) => {
            allFeaturedProducts.push({
              id: record._rawJson.id,
              ...record._rawJson.fields,
            });
          });
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
          } else {
            asset.save(allFeaturedProducts, "json");
            resolve(allFeaturedProducts);
          }
        },
      );
  });
};

