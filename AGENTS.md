# AGENTS.md - AI Coding Agent Guidelines

This document provides guidelines for AI coding agents working in this
repository.

## Project Overview

Alfred workflow for GitHub - provides quick access to GitHub repos, gists,
notifications, and more from Alfred.

- **Runtime:** Deno (v1.x)
- **Language:** TypeScript
- **Platform:** macOS (Alfred workflow)

## Build/Lint/Test Commands

Use `just` to run commands. See `justfile` for available recipes.

| Task                    | Command                                  |
| ----------------------- | ---------------------------------------- |
| List all commands       | `just`                                   |
| Run all tests           | `just test`                              |
| Run single test file    | `just test src/mine.test.ts`             |
| Run test by name        | `just test --filter "test name"`         |
| Run tests in watch mode | `just test --watch`                      |
| Format code             | `just fmt`                               |
| Check formatting        | `just fmt-check`                         |
| Lint                    | `just lint`                              |
| Run all CI checks       | `just ci`                                |

### CI Pipeline

Tests run on `macos-latest` and must pass before merging:

1. `deno fmt --check`
2. `deno lint`
3. `deno test --allow-env --allow-read --allow-write --allow-ffi --allow-net`

## Commit Messages

Use the Semantic Commit Message style:

- **type**: The type of change (see below)
- **scope**: Optional, the area of the codebase affected (e.g., `auth`, `api`,
  `ui`)
- **subject**: A brief description in imperative mood, lowercase, no full stop

## Code Style Guidelines

### Imports

- Use JSR imports for Deno standard library (configured in `deno.jsonc`)
- Local imports must use explicit `.ts` extensions
- Order: external packages first, then local modules

```typescript
import { Database } from "sqlite";
import { Config } from "./helpers/config.ts";
import "./alfred.d.ts";
```

### Formatting

- 2-space indentation
- Double quotes for strings
- Semicolons required
- Trailing commas in multi-line arrays/objects
- Run `deno fmt` before committing

### Types

- Define explicit TypeScript interfaces for all data structures
- Generic types: `cacheFetchAll<T>(config: Config, url: string): Promise<T[]>`
- Type declarations for Alfred APIs in `src/alfred.d.ts`

```typescript
interface GhUser {
  login: string;
  avatar_url: string;
  type: string;
}
```

### Naming Conventions

| Type             | Convention       | Example                         |
| ---------------- | ---------------- | ------------------------------- |
| Interfaces/Types | PascalCase       | `Config`, `BuildItem`, `GhUser` |
| Functions        | camelCase        | `prefetchConfig`, `updateCache` |
| Default exports  | PascalCase       | `Mine`, `Search`, `Setting`     |
| Variables        | camelCase        | `queryArgs`, `itemCount`        |
| Constants        | UPPER_SNAKE_CASE | `TWENTY_FOUR_HOURS`             |

### Error Handling

- Use try-catch for database and network operations
- Type-check errors: `if (err instanceof Error)`
- Log errors with `console.error(err)`
- Prefer graceful degradation over crashing
- Use early returns: `if (!config.token) return Promise.resolve();`

### Module Pattern

- Default exports for main module functions (entry points)
- Named exports for internal/helper functions
- Export `_internals` object for test mocking:

```typescript
async function fetchUser(config: Config): Promise<GhUser | undefined> {
  // implementation
}

export const _internals = { fetchUser };

export default async function Mine(
  args: QueryArgs,
  items: Item[],
  config: Config,
) {
  // uses _internals.fetchUser for testability
}
```

## Testing Guidelines

- Test files co-located with source: `mine.ts` / `mine.test.ts`
- Use `Deno.test()` with nested `t.step()` for grouped tests
- Follow Arrange-Act-Assert pattern
- Use `stub()` from Deno std testing/mock on `_internals`
- Always restore stubs in `finally` block

```typescript
import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import {
  resolvesNext,
  stub,
} from "https://deno.land/std@0.160.0/testing/mock.ts";
import Mine, { _internals } from "./mine.ts";

Deno.test("Mine", async (t) => {
  await t.step("should fetch user repos", async () => {
    const userFetch = stub(_internals, "fetchUser", resolvesNext([[mockUser]]));
    try {
      const items: Item[] = [];
      await Mine({ query: "my repo", action: "" }, items, config);
      assertEquals(items.length, 2);
    } finally {
      userFetch.restore();
    }
  });
});
```

## File Organization

```
/
├── mod.ts              # Entry point
├── env.ts              # Environment constants
├── deno.jsonc          # Deno configuration
├── src/
│   ├── alfred.d.ts     # Alfred type declarations
│   ├── workflow.ts     # Main workflow logic
│   ├── action.ts       # Action handlers
│   ├── *.ts            # Feature modules
│   ├── *.test.ts       # Tests (co-located)
│   └── helpers/
│       ├── builder.ts  # Item builder
│       ├── cache.ts    # Caching logic
│       ├── config.ts   # Configuration
│       └── github.ts   # GitHub API
├── icons/              # Workflow icons
└── .github/workflows/  # CI configuration
```

## Key Patterns

### Alfred Item Building

```typescript
import Builder from "./helpers/builder.ts";

const builder = Builder({ name: "repos", config });
builder.addItem({
  title: repo.name,
  subtitle: repo.description,
  arg: repo.html_url,
  icon: { path: "icons/repos.png" },
});
```

### Caching

- Cache GitHub API responses in SQLite database
- Use `cacheFetch` / `cacheFetchAll` from `helpers/cache.ts`
- Cache duration constants defined in `env.ts`

### Configuration

- Config loaded via `prefetchConfig()` from `helpers/config.ts`
- Contains token, cache paths, user preferences
- Never commit tokens or secrets
