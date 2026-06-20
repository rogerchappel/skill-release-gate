# Release Helper Skill

Use this skill when an agent needs to prepare a release-candidate checklist for a local repository.

## Inputs

Required inputs are the repository path, package manager, and the intended release-candidate branch.

## Tools

The skill uses local shell commands and filesystem reads. It does not require network access by default.

## Side Effects

The agent may write release notes in the workspace. Publishing, tagging, pushing, sending messages, or other external actions require explicit approval.

## Examples

Example: prepare a release-candidate checklist for a Node CLI and include smoke command results.

## Verification

Run tests, build, smoke commands, and validate release notes before reporting completion.

## Limitations

This skill cannot prove package security or publish artifacts.

## Release Notes

Release candidate 0.1.0 documents local-only behavior and approval requirements.
