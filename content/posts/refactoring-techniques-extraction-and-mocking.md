---
title: Refactoring Techniques - Extraction and Mocking
author: Alex Dawson
date: 2021-12-17T12:29:10.512Z
draft: true
type: post
tags:
  - Golang
---
Summary: a post about the differences between refactoring for tests by extracting functionality into a pure function vs mocking inputs.

{{< lead >}}

Sometimes we really want to test some logic but the existing code is structured in a way that makes it difficult or not worth it to do. I can came across this recently when I was working on porting some code from PHP to a Go service. Here's the approach I take to tranform the untestable into something testable.

{{< /lead >}}

The code I ported had a single well defined job - to take a folder and filename, and generate a unique name for that file if it required one. For example, if my folder contains \`file.txt\` and an incoming file is named \`file.txt\`, the unique name for that incoming file should look like \`file-1.txt\`. 

The PHP I ported from was a little complex, and did some checking of things I wasn't sure was necessary. I also wanted to make sure my understanding of what happened in PHP land mapped to what I'd written in Go. I have real data for the PHP code so I can compare inputs and outputs, but