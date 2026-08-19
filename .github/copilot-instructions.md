---
description: "Global workspace instructions for the TODO application project"
---

# TODO Application - Copilot Instructions

## Project Context

This is a full-stack TODO application with:
- **Frontend**: React-based user interface
- **Backend**: Express API server
- **Development Philosophy**: Iterative, feedback-driven development
- **Current Phase**: Backend stabilization and frontend feature completion

## Documentation References

Refer to these documentation files for detailed guidance:
- [docs/project-overview.md](../docs/project-overview.md) - Architecture, tech stack, and project structure
- [docs/testing-guidelines.md](../docs/testing-guidelines.md) - Test patterns and standards
- [docs/workflow-patterns.md](../docs/workflow-patterns.md) - Development workflow guidance

## Development Principles

Follow these core principles for all development work:

- **Test-Driven Development**: Use the RED-GREEN-REFACTOR cycle
  - Write tests first (RED)
  - Implement minimal code to pass (GREEN)
  - Improve code quality while keeping tests green (REFACTOR)
- **Incremental Changes**: Make small, testable modifications rather than large rewrites
- **Systematic Debugging**: Use test failures as guides to identify and fix issues
- **Validation Before Commit**: Ensure all tests pass and no lint errors exist before committing

## Testing Scope

This project uses a multi-layered testing approach:

### Testing Tools
- **Backend**: Jest + Supertest for API testing
- **Frontend**: React Testing Library for component unit/integration tests
- **UI Testing**: Playwright for critical user journey automation
- **Manual Testing**: Browser testing for exploratory validation and visual checks

### Rationale
Combine fast feedback from unit/integration tests with end-to-end quality confidence from UI tests.

### Testing Approach by Context

**Backend API Changes**:
- Write Jest tests FIRST, then implement (RED-GREEN-REFACTOR)
- This is true TDD: Test first, then code to pass the test

**Frontend Component Features**:
- Write React Testing Library tests FIRST for component behavior
- Implement code to pass the tests (RED-GREEN-REFACTOR)
- Follow with manual browser testing for full UI flows

**UI End-to-End Testing**:
- Use Playwright for critical user journeys
- DO NOT create or run Playwright tests in tdd-developer mode
- Delegate UI test work to test-engineer agent

## Workflow Patterns

Follow these established workflows for different types of work:

### 1. TDD Workflow
1. Write/fix tests
2. Run tests (expect failure - RED)
3. Implement minimal code to pass (GREEN)
4. Refactor while keeping tests green
5. Verify all tests pass

### 2. Code Quality Workflow
1. Run lint checks
2. Categorize issues by type/severity
3. Fix issues systematically
4. Re-validate with lint
5. Confirm no errors remain

### 3. Integration Workflow
1. Identify the integration issue
2. Debug to find root cause
3. Write/update tests to cover the issue
4. Implement the fix
5. Verify end-to-end functionality

### 4. UI Testing Workflow
1. Define critical user journeys
2. Create Playwright UI tests
3. Run tests to establish baseline
4. Debug any failures
5. Validate test coverage

## Agent Usage

Use specialized agents for specific tasks:

### tdd-developer
- **Use for**: Implementation and unit/integration TDD cycles
- **Capabilities**: Writing Jest tests, React Testing Library tests, implementing features
- **Restrictions**: Do NOT create or run Playwright UI tests in this mode

### code-reviewer
- **Use for**: Addressing lint errors and code quality improvements
- **Capabilities**: Identifying issues, suggesting fixes, enforcing standards
- **Focus**: Code style, best practices, maintainability

### test-engineer
- **Use for**: All Playwright UI test work
- **Capabilities**: UI test authoring, execution, failure triage, isolation checks
- **Ownership**: Complete responsibility for end-to-end UI testing

## Memory System

This project uses a two-tier memory system to track development discoveries and maintain consistency:

### Persistent Memory
- **Location**: This file (`.github/copilot-instructions.md`)
- **Purpose**: Foundational principles and workflows that rarely change
- **Contains**: TDD philosophy, Git workflow, testing approach, agent usage
- **Update Frequency**: Infrequent - only when core practices evolve

### Working Memory
- **Location**: `.github/memory/` directory
- **Purpose**: Evolving knowledge from active development
- **Contains**: Session notes, discovered patterns, active work tracking
- **Update Frequency**: Regular - updated during and after development

### Memory Files

**`.github/memory/session-notes.md`** (Committed):
- Historical summaries of completed development sessions
- What was accomplished, key findings, and outcomes
- Reference for understanding project history

**`.github/memory/patterns-discovered.md`** (Committed):
- Catalog of code patterns and solutions to reuse
- Pattern name, context, problem, solution, and examples
- Ensures consistency across the codebase

**`.github/memory/scratch/working-notes.md`** (NOT Committed - Ephemeral):
- Active notes during current development session
- Current task, approach, findings, and decisions
- Summarized into session-notes.md at session end
- Keeps repository clean of work-in-progress thoughts

### During Development

**Active Work**: Take notes in `.github/memory/scratch/working-notes.md`
- Track TDD cycle progress (RED-GREEN-REFACTOR)
- Document findings as you discover them
- Record decisions and blockers

**Session End**: Summarize and commit
1. Extract key findings into `.github/memory/session-notes.md`
2. Document reusable patterns in `.github/memory/patterns-discovered.md`
3. Clear or archive scratch notes
4. Commit session-notes and patterns files

**AI Integration**: GitHub Copilot and specialized agents reference these files to:
- Apply documented patterns consistently
- Understand project history and decisions
- Maintain code quality standards
- Provide context-aware suggestions

See [.github/memory/README.md](memory/README.md) for detailed usage instructions and workflow integration.

## Workflow Utilities

### GitHub CLI Commands

Use these commands for workflow automation (available in all modes):

```bash
# List open issues
gh issue list --state open

# Get issue details
gh issue view <issue-number>

# Get issue with comments
gh issue view <issue-number> --comments
```

### Exercise Workflow
- The main exercise issue will have "Exercise:" in the title
- Steps are posted as comments on the main issue
- Use these commands when `/execute-step` or `/validate-step` prompts are invoked

## Git Workflow

### Conventional Commits
Use conventional commit format for all commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `test:` - Test additions or modifications
- `refactor:` - Code restructuring without behavior change

### Branch Strategy
- **Feature branches**: `feature/<descriptive-name>`
- **Bug fixes**: `fix/<descriptive-name>`
- **Always stage all changes**: `git add .` before committing
- **Push to correct branch**: `git push origin <branch-name>`

### Commit Workflow
```bash
# Stage all changes
git add .

# Commit with conventional format
git commit -m "feat: add user authentication"

# Push to feature branch
git push origin feature/user-authentication
```
