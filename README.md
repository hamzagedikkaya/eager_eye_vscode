<p align="center">
  <img src="images/icon.png" alt="EagerEye Logo" width="140">
</p>

<h1 align="center">EagerEye for VS Code</h1>

<p align="center">
  <strong>Real-time static analysis for detecting N+1 queries in Rails applications.</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=hamzagedikkaya.eager-eye"><img src="https://img.shields.io/visual-studio-marketplace/v/hamzagedikkaya.eager-eye?label=VS%20Code%20Marketplace" alt="VS Code Marketplace"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=hamzagedikkaya.eager-eye"><img src="https://img.shields.io/visual-studio-marketplace/i/hamzagedikkaya.eager-eye?label=Installs" alt="Installs"></a>
  <a href="https://rubygems.org/gems/eager_eye"><img src="https://img.shields.io/badge/gem-v1.1.0-red.svg" alt="Gem Version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

<p align="center">
  <em>Catch N+1 queries before they hit production — right in your editor.</em>
</p>

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Detected Issues](#detected-issues)
- [Commands](#commands)
- [Extension Settings](#extension-settings)
- [How It Works](#how-it-works)
- [Related](#related)
- [License](#license)

## Features

**Real-time Analysis** — Automatically analyzes Ruby files on save, highlighting potential N+1 issues instantly.

**Problem Highlighting** — Squiggly underlines show exactly where N+1 queries may occur in your code.

**Quick Fixes** — One-click fixes for common issues like replacing `.pluck(:id)` with `.select(:id)`.

**Status Bar Integration** — See issue count at a glance in your VS Code status bar.

**7 Detector Types** — Comprehensive detection covering the most common N+1 patterns in Rails applications.

## Installation

### Prerequisites

Install the [EagerEye gem](https://rubygems.org/gems/eager_eye):

```bash
gem install eager_eye
```

Or add to your Gemfile:

```ruby
gem "eager_eye", group: :development
```

### Install Extension

**Option 1:** Search for "EagerEye" in VS Code Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)

**Option 2:** Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=hamzagedikkaya.eager-eye)

**Option 3:** Command line:
```bash
code --install-extension hamzagedikkaya.eager-eye
```

## Quick Start

1. Open a Rails project in VS Code
2. Open any Ruby file (controller, model, serializer, etc.)
3. Save the file — EagerEye automatically analyzes it
4. Issues appear as warnings with squiggly underlines
5. Hover over underlined code to see details and suggestions

## Detected Issues

EagerEye detects **7 types** of N+1 query patterns:

| Detector | Description |
|----------|-------------|
| **Loop Association** | Queries inside iterations (`posts.each { \|p\| p.author }`) |
| **Serializer Nesting** | Association calls in serializer blocks |
| **Missing Counter Cache** | `.count`/`.size` calls that could use counter cache |
| **Custom Method Query** | `.where`/`.find_by` on associations inside loops |
| **Count in Iteration** | `.count` inside loops (always executes query) |
| **Callback Query** | N+1 patterns inside ActiveRecord callbacks |
| **Pluck to Array** | `.pluck(:id)` used in `where` instead of subquery |

### Example Detection

```ruby
# EagerEye will warn about this:
posts.each do |post|
  post.author.name      # ⚠️ N+1 query detected
  post.comments.count   # ⚠️ COUNT query for each post
end

# Suggested fix:
posts.includes(:author, :comments).each do |post|
  post.author.name      # ✓ No additional query
  post.comments.size    # ✓ No additional query
end
```

## Commands

Access commands via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

| Command | Description |
|---------|-------------|
| `EagerEye: Analyze Current File` | Manually trigger analysis on active file |
| `EagerEye: Analyze Workspace` | Analyze all Ruby files in workspace |
| `EagerEye: Clear Diagnostics` | Clear all EagerEye warnings |

## Extension Settings

Configure EagerEye in VS Code settings (`Cmd+,` / `Ctrl+,`):

| Setting | Default | Description |
|---------|---------|-------------|
| `eagerEye.enable` | `true` | Enable/disable the extension |
| `eagerEye.analyzeOnSave` | `true` | Automatically analyze on file save |
| `eagerEye.gemPath` | `eager_eye` | Path to eager_eye executable |
| `eagerEye.enabledDetectors` | `[]` | Specific detectors to enable (empty = all) |
| `eagerEye.excludePatterns` | `["**/spec/**", "**/test/**", "**/vendor/**"]` | Glob patterns to exclude |

### Example Configuration

```json
{
  "eagerEye.enable": true,
  "eagerEye.analyzeOnSave": true,
  "eagerEye.excludePatterns": [
    "**/spec/**",
    "**/test/**",
    "**/vendor/**",
    "**/legacy/**"
  ],
  "eagerEye.enabledDetectors": [
    "loop_association",
    "serializer_nesting"
  ]
}
```

## How It Works

EagerEye uses **static analysis** with AST (Abstract Syntax Tree) parsing to detect potential N+1 query patterns without running your code. This means:

- **No test suite required** — Works on any Ruby file
- **No runtime overhead** — Analysis happens at parse time
- **Instant feedback** — See issues as you code

For comprehensive N+1 detection, use EagerEye alongside runtime tools like [Bullet](https://github.com/flyerhzm/bullet).

## Related

- [EagerEye Gem](https://github.com/hamzagedikkaya/eager_eye) — CLI tool and Ruby gem
- [RubyGems](https://rubygems.org/gems/eager_eye) — Gem installation
- [Report Issue](https://github.com/hamzagedikkaya/eager_eye_vscode/issues) — Bug reports and feature requests

## License

This extension is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

---

<p align="center">
  Made with ❤️ for the Rails community
</p>
