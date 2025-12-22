#!/usr/bin/env zsh

# This script is run after the dev container is created.

# Activate Bun completions in zsh on startup
if ! grep -q 'source <(SHELL=zsh bun completions)' ~/.zshrc; then
    echo 'source <(SHELL=zsh bun completions)' >>~/.zshrc
fi

# Install dependencies
bun install