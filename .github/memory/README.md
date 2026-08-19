# Working Memory System

## Purpose

This directory tracks development discoveries, patterns, and lessons learned during active development. It serves as a knowledge base that both human developers and AI assistants reference to maintain consistency and apply learned patterns across sessions.

## Memory Architecture

This project uses a two-tier memory system:

### 1. **Persistent Memory** (`.github/copilot-instructions.md`)
- **What**: Foundational principles, workflows, and stable conventions
- **Scope**: Core development philosophy that rarely changes
- **Examples**: TDD principles, Git workflow, conventional commits, testing approach
- **Update Frequency**: Infrequent - only when core practices evolve

### 2. **Working Memory** (`.github/memory/` directory)
- **What**: Discoveries, patterns, and session-specific learnings
- **Scope**: Evolving knowledge from active development
- **Examples**: Code patterns discovered, debugging findings, design decisions
- **Update Frequency**: Regular - updated during and after development sessions

## Directory Structure

```
.github/memory/
├── README.md                    # This file - explains the system
├── session-notes.md             # Historical summaries of completed sessions
├── patterns-discovered.md       # Accumulated code patterns and solutions
└── scratch/                     # Active session work (not committed)
    ├── .gitignore              # Ignores all files in scratch/
    └── working-notes.md        # Template for current session notes
```

### File Purposes

#### `session-notes.md` (Committed to Git)
**Purpose**: Historical record of completed development sessions

**When to Use**:
- After completing a feature or major task
- At the end of a development session
- When closing out an issue or PR

**Content**: Session summaries with:
- What was accomplished
- Key findings and decisions
- Outcomes and results

**Why Committed**: Provides project history and context for future work

---

#### `patterns-discovered.md` (Committed to Git)
**Purpose**: Catalog of recurring code patterns and solutions

**When to Use**:
- When you discover a pattern that should be reused
- After solving a problem that might recur
- When establishing a new convention

**Content**: Pattern documentation with:
- Pattern name and context
- Problem it solves
- Solution and example code
- Related files

**Why Committed**: Ensures consistency across the codebase

---

#### `scratch/working-notes.md` (NOT Committed - Ephemeral)
**Purpose**: Active notes during current development session

**When to Use**:
- During active TDD cycles (RED-GREEN-REFACTOR)
- While debugging complex issues
- When making decisions that need tracking
- For temporary thoughts and exploration

**Content**: Living document with:
- Current task and approach
- Key findings as you discover them
- Decisions being made
- Blockers and next steps

**Why Not Committed**: 
- Contains work-in-progress thoughts
- May have redundant or incorrect information
- Gets summarized into session-notes.md at session end
- Keeps repository clean of temporary notes

---

## Workflow Integration

### During TDD Workflow

**RED Phase** (Writing Failing Test):
```markdown
# In scratch/working-notes.md
## Current Task
Implement DELETE /todos/:id endpoint

## Approach
- Write test first for successful deletion
- Write test for non-existent todo (404)
- Implement minimal code to pass

## Key Findings
- Need to handle ID validation
```

**GREEN Phase** (Making Test Pass):
```markdown
## Key Findings
- Need to handle ID validation
- Array.filter() works cleanly for deletion
- Return 404 if todo not found before deletion
```

**REFACTOR Phase**:
```markdown
## Decisions Made
- Extract ID validation to separate function
- Consistent error response format across all endpoints

## Pattern Discovered
→ Will document in patterns-discovered.md
```

**Session End**:
```markdown
# Move summary to session-notes.md
Session: Implement DELETE endpoint
Date: 2026-08-19
Accomplishment: Fully tested DELETE /todos/:id with validation
Key Finding: Validation pattern should be consistent across endpoints
```

---

### During Linting Workflow

**Active Work**:
```markdown
# In scratch/working-notes.md
## Current Task
Fix ESLint errors in backend

## Approach
1. Run lint to identify all errors
2. Categorize by type
3. Fix systematically
4. Re-validate

## Key Findings
- console.log statements in 3 files
- Unused import in app.js
```

**Session Summary**:
```markdown
# Add to session-notes.md
Session: Backend lint cleanup
Date: 2026-08-19
Accomplishment: All ESLint errors resolved
Outcome: Clean codebase ready for PR
```

---

### During Debugging Workflow

**Active Investigation**:
```markdown
# In scratch/working-notes.md
## Current Task
Debug: Todo not persisting after creation

## Approach
1. Check POST endpoint response
2. Verify state management
3. Test GET after POST

## Key Findings
- POST returns 201 correctly
- GET shows empty array
- Issue: In-memory array not shared between requests

## Decisions Made
- Need proper state management
- Consider database or persistent storage
```

**Pattern Documentation**:
```markdown
# Add to patterns-discovered.md
## Pattern: Service State Initialization

**Problem**: In-memory state resets between requests in Express
**Solution**: Initialize shared state at module level, not request level
**Example**: See packages/backend/src/app.js
```

---

## How AI Uses This Memory

When you work with GitHub Copilot or other AI assistants:

1. **Context Loading**: AI reads session-notes.md and patterns-discovered.md to understand project history

2. **Pattern Application**: When implementing similar features, AI references documented patterns

3. **Consistency**: AI follows established conventions from pattern documentation

4. **Decision Context**: AI understands why certain approaches were chosen based on session history

5. **Active Tracking**: During development, AI can update scratch/working-notes.md with findings

**Example AI Interaction**:
```
User: "Implement PUT endpoint for updating todos"

AI: [Reads patterns-discovered.md]
    "I see we have a validation pattern for ID handling.
     I'll follow the same pattern used in DELETE endpoint.
     
     Let's start by writing the test first (TDD)..."
```

---

## Best Practices

### ✅ DO:
- Update `scratch/working-notes.md` during active development
- Summarize key findings into `session-notes.md` at session end
- Document reusable patterns in `patterns-discovered.md`
- Keep notes concise and actionable
- Include code examples in pattern documentation
- Reference specific files and line numbers

### ❌ DON'T:
- Commit `scratch/working-notes.md` (it's gitignored)
- Duplicate information between files
- Write vague or generic patterns
- Let scratch notes accumulate without summarizing
- Document obvious or one-off solutions

---

## Maintenance

### Weekly Review:
- Review `patterns-discovered.md` for outdated patterns
- Archive old session notes if needed
- Ensure patterns are still followed in codebase

### Session Cleanup:
- Clear `scratch/working-notes.md` after summarizing to `session-notes.md`
- Move valuable patterns from scratch to `patterns-discovered.md`
- Update pattern examples if code has changed

---

## Example Workflow

**Start of Development Session**:
1. Open `scratch/working-notes.md`
2. Write current task and approach
3. Work on feature (TDD cycle)
4. Update findings as you discover them

**During Development**:
```bash
# Make changes, run tests
npm test

# Update working-notes.md with findings
# Continue RED-GREEN-REFACTOR
```

**End of Session**:
1. Review `scratch/working-notes.md`
2. Summarize key points into `session-notes.md`
3. Extract patterns into `patterns-discovered.md`
4. Clear or archive scratch notes
5. Commit session-notes and patterns files

---

## Integration with TDD Agent

When using `@tdd-developer`:

- Agent reads `patterns-discovered.md` to apply established patterns
- Agent reads `session-notes.md` to understand recent work
- Agent can update `scratch/working-notes.md` during TDD cycles
- Agent reminds to document patterns at session end

---

## Questions?

This system evolves with the project. If you discover better ways to organize knowledge, update this README and the structure accordingly.

**Remember**: The goal is to capture valuable learnings without creating documentation overhead. Keep it lightweight and useful.
