# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML landing page for **juridik.lol** — a Swedish law-themed site with pixel art/vaporwave aesthetic. Hosted on GitHub Pages.

## Architecture

Single-file project: everything lives in `index.html` (HTML structure, embedded CSS, inline JavaScript). No build system, no frameworks, no package.json.

- **Styling:** CSS variables define the neon-on-dark color palette (`--cyan`, `--magenta`, `--yellow`, etc.) with Press Start 2P pixel font
- **Animations:** CSS keyframes (glitch effect, floating icons) + canvas-based particle system (twinkling stars)
- **Deployment:** GitHub Pages via `main` branch, custom domain configured in `CNAME`

## Development

Open `index.html` directly in a browser. No build or install step.

## Language

All UI text and commit messages are in Swedish.
