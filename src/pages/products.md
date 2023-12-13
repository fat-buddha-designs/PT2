---
layout: productfeed
eleventyComputed:
  title: Our Products{% if pagination.pageNumber > 0 %} - Page {{ pagination.pageNumber }}{% endif %}
  description: "This is the full range of our quality wooden outdoor products that we manufacture from pressure treated wood and stainless steel hardware.{% if pagination.pageNumber > 0 %} - Page {{ pagination.pageNumber }}{% endif %}"
keywords: ['Quality Wooden Products', 'Wooden Products', 'Outdoor Wooden Products', 'Plant Theatres', 'Wall Planters', 'Bird Boxes', 'Nesting Boxes', 'Steel Sculptures', 'Steel Garden Sculptures']
pageType: products
pagination:
  data: products
  size: 50
permalink: "products/"
---

The latest products from us.
