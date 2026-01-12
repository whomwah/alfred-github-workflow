# List available recipes
default:
    @just --list

# Run all tests
test *ARGS:
    deno test --allow-env --allow-read --allow-write --allow-ffi --allow-net {{ ARGS }}

# Format code
fmt *ARGS:
    deno fmt {{ ARGS }}

# Check formatting without making changes
fmt-check:
    deno fmt --check

# Run linter
lint:
    deno lint

# Run all CI checks (format, lint, test)
ci: fmt-check lint test

# Build a release with version and optional release notes
build-release VERSION NOTES="":
    ./bin/build_release "{{ VERSION }}" "{{ NOTES }}"
