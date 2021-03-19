Alex Dawson's portfolio
======

My portfolio site, built on Hugo.

# Cloning

To clone this repo: 

```shell
git clone git@github.com:dawsonalex/portfolio.git
```

Then clone the submodule theme(s)

```shell
git submodule update --init --recursive
```

# Running locally

Run the local hugo server using one of the following commands:

```shell
# Run the development config
hugo server -e development

# Run the local staging config
hugo server -e staging-local

# Run the full production environment
hugo server -e production
```
