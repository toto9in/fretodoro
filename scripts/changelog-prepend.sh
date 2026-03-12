#!/bin/sh
git-cliff --tag "$1" --prepend CHANGELOG.md
git add CHANGELOG.md
