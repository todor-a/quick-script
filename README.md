# 🚤 quick-script

Ever wanted to quickly prototype an idea, but got stuck messing with tooling, dependencies, formatting, and everything else, only to forget what you set out to build in the first place? Well, I have.

`quick-script` is a simple utility for bootstrapping a script fast.
It includes a minimal starter with things I always have to look up:
- reading a file
- parsing CLI args
- printing colored text

Plus, it comes pre-configured with a formatter and format-on-save.

Besides all that, all templates come with minimal dependencies and try to leverage native APIs instead.

# Usage

```
npm create quick-script@latest --name update-users --engine bun
```

Also available via `pnpm`, `bun`, and `yarn`.

## Options

All options are optional. If not provided, you will be prompted to enter them.

- `--name` - the name of your new project
- `--engine` - the engine you want to use - either `bun`, `node`, or `deno`
- `--target` - where you want your new project to live