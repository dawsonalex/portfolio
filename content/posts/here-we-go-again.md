---
title: Here we go again
author: Alex Dawson
date: 2021-04-20T09:24:27.564Z
draft: true
type: post
---
{{< lead >}}

Every time I start a blog or personal website I follow the same pattern. Research some technology, set it up, design the site, find a small issue or something I want to change, spend all time and effort fixing, updating, or rewriting that part, then scrap it all and move to a different technology.

This time I refuse to follow that cycle.

{{< /lead >}}

Me at work, solves problems differently from me at home. During the day, when writing code for a new feature or refactoring something, I try to think about the ways my changes are going to impact the code base. I want to make sure my solution is robust, and easily understood by other people.

At home on personal projects, my values are different. I want to solve my problem and get on with something else. I want to get a site up and running with as little pain and maintenance as possible. But there's a still the same guiding curiosity. 

### Wanting to try new tech in spare time.

So, this time I've chosen Hugo, and Netlify to build my personal site. Before touching any code I designed the pages on Figma, so I had something to aim for visually. I wanted something minimal in terms of style, and technologies, so there are no other libraries on the site, just plain HTML, CSS and JS. 

Netlify has this great feature of branch deploys, where pushing a commit to your GitHub repository will trigger a build of the site, and the branch instance is available as a subdomain of your existing site. For example, pushing to a branch named `develop` would create a site at `develop.example.com` if I have the domain `example.com`. 

### TODO: Explain issue with pricing and Basic Auth