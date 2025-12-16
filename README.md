# EagerEye for VS Code

Static analysis for detecting N+1 queries in Rails applications.

## Features

- **Real-time Analysis** - Automatically analyzes Ruby files on save
- **Problem Highlighting** - Underlines potential N+1 issues
- **Quick Fixes** - One-click fixes for common issues
- **Status Bar** - Shows issue count at a glance

## Requirements

- [EagerEye gem](https://rubygems.org/gems/eager_eye) installed:
  ```bash
  gem install eager_eye
  ```

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `eagerEye.enable` | `true` | Enable/disable extension |
| `eagerEye.analyzeOnSave` | `true` | Analyze on file save |
| `eagerEye.gemPath` | `eager_eye` | Path to executable |
| `eagerEye.excludePatterns` | `["**/spec/**", ...]` | Files to exclude |

## Commands

- `EagerEye: Analyze Current File`
- `EagerEye: Analyze Workspace`
- `EagerEye: Clear Diagnostics`

## Detected Issues

- Loop Association
- Serializer Nesting
- Missing Counter Cache
- Custom Method Query
- Count in Iteration
- Callback Query
- Pluck to Array

## Links

- [EagerEye Gem](https://github.com/hamzagedikkaya/eager_eye)
- [Report Issue](https://github.com/hamzagedikkaya/eager_eye_vscode/issues)