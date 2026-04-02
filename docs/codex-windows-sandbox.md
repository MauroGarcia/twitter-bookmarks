# Codex Windows Sandbox Workflow

This repository is used on a Windows Codex runner where some simple read-only shell commands can fail before they execute.

## Known symptom

Commands such as `rg`, `git status`, `Get-Content`, or even `Get-Location` may fail with:

`windows sandbox: runner error: CreateProcessAsUserW failed: 5`

That error means the runner blocked process launch. It does not mean the workspace path itself is unreadable.

## Required behavior

- Do not generalize this into "the sandbox is blocking workspace reads."
- Describe the failure precisely: the Windows sandbox blocked that command before execution.
- Keep escalation narrow. Ask only for the specific command that failed.
- If a safe approved command path is available, prefer it before escalating.

## Practical guidance

- Use `Get-ChildItem -Force . | Select-Object Name,Mode,Length` for a quick workspace listing.
- Expect generic discovery commands to be less reliable in the sandbox on this machine.
- When a targeted read is necessary and the runner blocks the command launch, request elevation for that read instead of assuming all file inspection is blocked.
- After the elevated read, continue normal code changes and validation without repeating the broader "workspace blocked" explanation.
