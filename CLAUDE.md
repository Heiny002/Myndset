# CLAUDE.md

## Task Workflow

1. **Read prd.json** to find the next incomplete task
2. **Check progress.txt Codebase Patterns first** before starting work
3. **Select highest priority story** where all `dependsOn` items are complete
4. **Implement the task** following the acceptance criteria
5. **Update prd.json** and append to **progress.txt** when done
6. **Notify User** to make them aware, in a concise manner, of what should now be visible, functional, or otherwise improved now that tasks are complete.

## Token Management

As best as you can, try to conserve tokens for anything generated in chat conversation with the user. Code should be as robust as necessary, but avoid superfluous messages with the user in chat.

## Self Improvement

If any development processes were discovered during a cycle, save them to this document under the Best Practices heading

## Best Practices
