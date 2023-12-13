---
layout: feed
eleventyComputed:
  title: Our News Articles{% if pagination.pageNumber > 0 %} - Page {{ pagination.pageNumber }}{% endif %}
  description: "These are our really interesting news articles. We post about subjects related to our lovely products{% if pagination.pageNumber > 0 %} - Page {{ pagination.pageNumber }}{% endif %}"
keywords: ['Articles', 'Journal', 'Posts']
pagination:
  data: articles
  size: 10
permalink: "news/"
---

The latest articles from us, demonstrating our design thinking, strategy and expertise.
