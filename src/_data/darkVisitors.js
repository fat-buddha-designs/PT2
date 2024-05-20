require("dotenv").config();
const EleventyFetch = require("@11ty/eleventy-fetch");
const { DARK_VISITORS_ACCESS_TOKEN } = process.env;

module.exports = () => {
  if ((DARK_VISITORS_ACCESS_TOKEN || "").trim().length === 0) {
    throw new Error("DARK_VISITORS_ACCESS_TOKEN must be defined");
  }

  return EleventyFetch("https://api.darkvisitors.com/robots-txts", {
    duration: "1d",
    type: "text",
    fetchOptions: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + DARK_VISITORS_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        agent_types: [
          "AI Assistant",
          "AI Data Scraper",
          "AI Search Crawler",
          "Undocumented AI Agent",
        ],
        disallow: "/",
      }),
    },
  });
};