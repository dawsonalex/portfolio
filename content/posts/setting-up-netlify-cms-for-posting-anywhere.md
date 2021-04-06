---
title: Setting up Netlify CMS for Posting Anywhere
author: Alex Dawson
date: 2021-03-26T09:56:52.909Z
draft: true
type: post
tags:
  - netlify
---
{{< lead >}}

Setting up a blog can be fun, especially if you're desiging and writing the site yourself. But I usually get put off from ever writing anything because I have ideas for posts when I'm away from laptop or PC, and writing notes on my phone is okay until I forget where I've put them. Here's how I've set up Netlify CMS with my Hugo site, so I can create drafts or full posts anywhere I have a web browser and internet connection.

{{< /lead >}}

## Adding the Admin Page and Content

Adding the admin page itself is easy, just create a directory under `/static` named `admin`, add a file named `index.html` and drop in the following:

```html

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio Title</title>
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  </head>
  <body>
    <script src="https://unpkg.com/netlify-cms@^2.0.0/dist/netlify-cms.js"></script>
  </body>
</html>

```



## Adding CMS Integration With a Theme

