#!/bin/bash

# Get the latest git commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)

# Write the commit hash to a text file
echo $COMMIT_HASH > commit-hash.txt