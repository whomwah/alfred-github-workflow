# An Alfred 5 Workflow for working with Github

This workflow is inspired by
[Alfred workflow](https://github.com/gharlan/alfred-github-workflow) by
[Gregor Harlan](https://github.com/gharlan). It came about as a side project as
I wanted a real use case to try [Deno](https://deno.land/). It's written in
[TypeScript](https://www.typescriptlang.org/). It contains as many of the high
level features in the original.

![Github Alfred 5 Workflow](./assets/workflow.gif)

## Install

This workflow requires the [Deno](https://deno.land/) binary to be installed.
This can be done simply from the [Deno](https://deno.land/) website above.

> [Deno](https://deno.land/) is a runtime for JavaScript.
> [Deno](https://deno.land/) was co-created by Ryan Dahl, who also created
> Node.js.

Once installed you can
[download the latest version](https://github.com/whomwah/alfred-github-workflow/releases)
and double click the `.workflow` file to open and install or update.

## Usage

By default you access the workflow via the `gh` command.

The first time you use the workflow you will need an access token so the
workflow can speak to github on your behalf. You can do this via the
`gh > login` command. Pressing enter will take you to an authorisation page on
Github. The permissions are used only by the workflow.

There are a few top level commands and other than that you just start typing a
`repo` or `user` you are interested in. Once you start seeing results, pressing
the auto complete key (⇥ by default) will show you any other sub commands
available.

```
# Settings

gh >...

# User commands

gh @...

# Your personal commands

gh my...

# Anything else

gh ...
```

## Development

You can build your own version of the workflow with:

```
./bin/build_release <version>

# example

./bin/build_release 1.2.3
```

## Resources

- Alfred App:: https://www.alfredapp.com/
- The inspiration for this version::
  https://github.com/gharlan/alfred-github-workflow

## Copyright

MIT License (http://www.opensource.org/licenses/mit-license.html)
