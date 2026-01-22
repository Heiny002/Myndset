# CLAUDE.md

## Task Workflow

1. **Read prd.json** to find the next incomplete task
2. **Check progress.txt Codebase Patterns first** before starting work
3. **Select highest priority story** where all `dependsOn` items are complete
4. **Implement the task** following the acceptance criteria
5. **Update prd.json** and append to **progress.txt** when done
6. **Notify User** to make them aware of what should now be visible, functional, or otherwise improved now that tasks are complete.
