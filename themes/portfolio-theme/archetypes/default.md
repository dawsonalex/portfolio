---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
tags: []
type: "post"
{{ with .Site.Params.author }}author: "{{ . }}"{{ end }}
---

{{< lead >}}
Use this to give your post an intro, or remove it if you don't want a lead paragraph.
{{< /lead >}}