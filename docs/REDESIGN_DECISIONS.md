# Redesign decisions

The only place Claude Code asks Srujan anything (runbook rule 7). Each question is numbered, has a recommended default, and says which phase is waiting on it. Reply inline under the question, or edit the file, and the next session picks it up. Hard gates (G1 merge, G2 delete content, G3 anything needing a secret or an account) always wait for an explicit answer.

## Open

_None yet._

## Answered

_None yet._
