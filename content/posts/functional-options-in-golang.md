---
title: Functional Options in Golang
author: Alex Dawson
date: 2021-09-04T11:00:25.219Z
draft: true
type: post
tags:
  - Golang
---
{{< lead >}}

Here's a short post on building functional options in Golang that can help prevent errors in the use of your API.

{{< /lead >}}

Let's imagine I have a package that will resize an image in certain way given some criteria that the user of our package will provide. A pattern I've used before when constructing some function that takes some configuration as a parameter is this: 

```go
package resize

const (
  // FixedSize resizes the image to a fixed width and height
  FixedSize Strategy = iota

  // Scale resizes the image up or down to the scale requested.
  Scale

  // Terminal resizes the image to the size of the terminal.
  Terminal
)

// Strategy defines the way the image should resized
type Strategy int

type Options struct {
  ResizeStrategy Strategy
  Scale    float64
  Width    int
  Height   int
}

func Buffer(img []byte, options Options) ([]byte, error) {
  // Do something with the buffer and options here.
}
```

Here I'm providing `Options` as a way to allow the user to set up some configuration and pass it to my `Buffer` function. Their code might look like: 

```go
package main

func main() {
  image, _ := ioutil.ReadFile("image.jpg")

  options := Options{
    ResizeStrategy: resize.Scale
    Width: 300
    Height: 300
  }
  resize.Buffer(image, options)
}
```

But there's a problem here. My user has accidentally set the width and height fields *with* `resize.Scale` as the `ResizeStrategy` on the Options struct. The (imaginary) documentation doesn't define the behavior when those fields are set, and my user might simply not understand that they shouldn't be set together. Now they're probably cursing me, and wondering why their image always resizes to a 300 pixel square.

How could this be fixed for the user? Perhaps more accurate documentation would help, but the list of configuration options could grow to be more complex, in which case writing more words about it probably wouldn't help.

Additionally, the configuration inside the resize package may be updated with a breaking change. In this case, the user would have to refactor their code to correct their configuration, and since that user is probably me I'm now wasting *my own* time!

The problem we're facing is that in forcing the user to work around *implementation details*. So what's the solution to this?

## A Solution

It looks like this:

```go
package resize

const (
  fixedSizeStrategy Strategy = iota
  scaleStrategy
  terminalStrategy
)

type Strategy int

type options struct {
  resizeStrategy Strategy
  scale          float64
  width          int
  height         int
}

type Option func(options *options)

func ToScale(scale float64) Option {
  return func(options *options) {
    options.resizeStrategy = scaleStrategy
    options.scale = scale
  }
}

func ToFixed(width, height int) Option {
  return func(options *options) {
    options.resizeStrategy = fixedSizeStrategy
    options.width = width
    options.height = height
  }
}

func ToTerminal() Option {
  return func(options *options) {
    options.resizeStrategy = terminalStrategy
  }
}

// Buffer resizes an image in a byte buffer using the options provided.
func Buffer(img []byte, optionSetter Option) ([]byte, error) {
  options := &options{
    resizeStrategy: terminalStrategy,
  }
  optionSetter(options)
}
```

So there has been some refactoring happen here - what's the difference? 

- We still have an options struct, but notice it's now unexported. 
- We also still have the Buffer function, with a slightly different signature.
- There is a new type named `Option` which is `func(options *options)`.
- There are three new functions that return the type `Option`.

Users can now make use of the package like so:

```go
package main

func main() {
  image, _ := ioutil.ReadFile("image.jpg")

  resize.Buffer(image, resize.ToScale(0.5))
}
```

In keeping `options` unexported, and exporting the `Option` type, with helped functions for setting fields we're doing a few things that help users.

First, we prevent them from having to create the struct decide on what fields to initalise in the first place. Second, we're reducing the amount of code they have to write to use the function. And finally, we're allowing room for the addition of other method of resizing without breaking existing code. 

For example, if we were to add a method of resizing an image to random size between some bounds we would add a new `Strategy` type for random resizing, and add the necessary options to our unexported struct, but the only change a user would notice is the addition of something like:

```go
func ToRandom() Option {
 return func(options *options) {
    options.resizeStrategy = randomStrategy
    options.someRandomField = // blah
  }
}
```

And there you have it. A tidy way of preventing configuration that should be internal from being exposed to users, and giving them a nice API instead.