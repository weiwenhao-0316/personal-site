---
name: project-development-workflow
description: "Run a lightweight enterprise-shaped workflow for agent-assisted software projects: turn vague ideas into scoped requirements, task prompts, architecture decisions, implementation, verification, release gates, and handoffs. Use when starting, standardizing, or continuing a project; do not use for an isolated code fix unless process guidance is requested."
---

# Project Development Workflow

Use this skill to keep agent-assisted development controlled from idea to release. The goal is not to create paperwork for its own sake. The goal is to make every change traceable: why it is needed, what is in scope, how it will be verified, and whether it is safe to release.

## Operating Model

Treat the project as an iterative delivery loop:

```text
需求发现
  -> 产品范围
  -> 技术方案
  -> 任务 Prompt
  -> 实现
  -> 测试与验收
  -> 发布上线
  -> 运行反馈与复盘
```

Use an enterprise-shaped process with lightweight execution for solo projects. Do not require every enterprise artifact before a small change. Add the smallest artifact that prevents the current class of mistake.

## Artifact Responsibilities

Keep these responsibilities separate:

| Artifact | Answers | Typical location |
|---|---|---|
| Product requirements | What problem are we solving, for whom, and what counts as success? | `docs/product-spec.md` |
| Architecture | How do the system boundaries, data, APIs, storage, and deployment fit together? | `docs/architecture.md` or the project's architecture document |
| `AGENTS.md` | Which repository rules must every coding agent follow? | Repository root or applicable subdirectory |
| Development workflow | How does a task move from request to release? | `docs/development-workflow.md` or this Skill |
| Roadmap | Which scoped tasks are planned, in progress, or complete? | `docs/roadmap.md` |
| Task Prompt | What must this agent do in this turn? | Chat message or task card |
| Tests and acceptance | How do we prove the change works? | `tests/` and `docs/acceptance-checklists/` |
| Release runbook | How is the change deployed, checked, and rolled back? | `docs/release-runbook.md` or deployment guide |
| Handoff | What is the verified state for the next agent? | `docs/ai-handoffs/` |
| README | What is the project and how can a person run it? | `README.md` |

Do not use the README as a requirements document. Do not use `AGENTS.md` as a replacement for the product specification. Do not mark a roadmap item complete only because an agent claims that code was written.

## Phase 0: Inspect Before Deciding

Before proposing implementation or changing files:

1. Inspect the repository structure, Git status, current branch, entry points, existing documentation, and relevant tests.
2. Identify the current source of truth for product scope, architecture, and deployment.
3. Compare documentation claims with the current code. Record conflicts instead of silently choosing one.
4. Check whether the requested feature already exists partially under another name or storage layer.
5. Determine whether the request is a product decision, a design decision, an implementation task, a verification task, or a deployment task.

If the request is vague and the ambiguity changes the implementation materially, ask at most three focused questions about goal, scope, and constraints. If a safe assumption is possible, state it and keep the work reversible.

## Phase 1: Define the Requirement

Before coding a new feature, write a short requirement in plain language:

```text
Problem:
Who uses it:
Desired outcome:
Main user flow:
In scope:
Out of scope:
Acceptance criteria:
Open decisions:
```

Classify ideas before adding them to the active task:

- Core loop: the product cannot perform its primary job without it.
- Experience improvement: an existing flow becomes clearer, faster, or safer.
- Future capability: valuable, but not needed for the current usable version.
- Deferred idea: intentionally recorded without implementation.

Only core-loop work should interrupt the current task. Keep speculative ideas in the roadmap or an ideas section; do not let them expand the active scope.

For a project whose product direction is still unclear, create or update a product-spec draft rather than pretending that uncertain ideas are requirements. Mark provisional decisions as provisional.

## Phase 2: Design the Solution

For a bounded change, answer only the design questions that affect correctness:

- Which page, module, or service owns the behavior?
- What data is read and written, and where is it stored?
- What is the API or module contract?
- What happens on loading, empty, invalid, offline, timeout, and failure states?
- What existing data or compatibility behavior must be preserved?
- What security, privacy, cost, or performance risks are introduced?
- What migration, rollback, or deployment step is required?

For cross-cutting or irreversible changes, record a short architecture decision before implementation. Distinguish current architecture from target architecture. Do not introduce a new database, framework, service, or abstraction only because it is fashionable.

## Phase 3: Write the Task Prompt

Every implementation task should have a concrete Prompt or task card:

```text
Task:

Background:

Goal:

Current behavior:

Expected behavior:

Allowed files or modules:

Must preserve:

Must not do:

Acceptance criteria:

Verification commands:

Deployment permission: not allowed unless explicitly granted by the user

Documents to update after completion:
```

The Prompt is the execution contract for one turn. It must not quietly expand into unrelated cleanup, a broad rewrite, or deployment work.

## Phase 4: Implement in Small Increments

During implementation:

1. Follow the repository's `AGENTS.md` and existing local patterns.
2. Keep edits within the task boundary. Preserve unrelated user changes.
3. Prefer the smallest design that satisfies the acceptance criteria.
4. Add input validation, error handling, loading states, and failure feedback when the feature needs them.
5. Keep secrets in environment configuration. Never place API keys, passwords, tokens, or private connection strings in code, logs, prompts, or committed documentation.
6. Do not perform production, database, DNS, Nginx, server, or external destructive operations without explicit user authorization.

If implementation reveals a product decision that was not defined, stop at the boundary, explain the decision, and ask for direction instead of inventing behavior.

## Phase 5: Verify Before Calling It Complete

Verification must match the risk of the change. Report facts, not intentions.

### Minimum verification

- Review `git diff` and confirm the change is in scope.
- Run the project's build or compile command.
- Exercise the changed user flow manually when it is user-facing.
- Check success, empty, invalid input, network failure, and refresh/reload behavior as applicable.
- Confirm no secret or prohibited file was added.

### For API or database changes

- Verify request validation and response shape.
- Verify success and expected error status codes.
- Verify persistence after a new request or page reload.
- Verify migration order and backward compatibility.
- Test rollback or at least document the rollback path for destructive schema changes.

### For frontend changes

- Verify the production build.
- Check loading, empty, error, duplicate-submit, and mobile behavior when applicable.
- Check that user-controlled URLs, HTML, images, and file names are handled safely.

### Completion report

Every completed task should state:

```text
Changed:
Why:
Verified:
Not verified:
Known risks:
Documents updated:
Deployment status:
```

Code written is not the same as a feature completed. A feature is complete only when its acceptance criteria pass or a user-approved exception is recorded.

## Phase 6: Review and Release

Before release, perform a release gate:

1. Confirm the requested scope and acceptance criteria are complete.
2. Confirm build and relevant tests pass.
3. Review secrets, environment variables, migrations, permissions, and external URLs.
4. Confirm the target environment and the exact commit to release.
5. Back up data before risky migrations or destructive operations.
6. Deploy only after explicit authorization for the environment operation.
7. Run health checks and core-flow smoke tests after deployment.
8. Record the deployed commit, result, remaining risk, and rollback path.

For a static frontend and API backend, the minimum smoke test should cover the home page, one read endpoint, one write flow, one failure response, and the API health endpoint. If the deployment cannot be verified, report it as “code complete, deployment unverified”.

Do not treat a green build as proof that the production service is running the new code.

## Phase 7: Update State for the Next Agent

After a meaningful milestone:

- Update the roadmap status and next task.
- Update the handoff document with verified facts, not assumptions.
- Record code/document conflicts for later resolution.
- Keep the product spec and architecture document aligned with decisions that are now final.
- If the project has a release note or changelog, record the user-visible change.

The handoff should answer:

```text
What is complete?
What is in progress?
What is not started?
What was verified?
What remains unverified?
What decisions are still open?
What should the next agent do first?
```

## Recommended Lightweight Project Set

Do not create every document by default. For a small personal project, start with:

```text
README.md
AGENTS.md
docs/
  product-spec.md
  architecture.md
  development-workflow.md
  roadmap.md
  ai-handoffs/
```

Add these when the project reaches the corresponding risk:

```text
docs/api-contract.md              when APIs become shared or numerous
docs/data-model.md                when multiple tables or storage layers exist
docs/acceptance-checklists/       when manual regression becomes repetitive
tests/                            when a feature has a stable contract
docs/release-runbook.md           when deployment has multiple steps
docs/decisions/                   when architecture choices are difficult to reverse
.github/workflows/                when CI should block bad changes
```

## Boundaries

- This Skill does not choose the product direction for the user.
- It does not require authentication, cloud storage, Docker, or CI before the product needs them.
- It does not authorize deployment, data deletion, database migration, or external communication.
- It does not replace framework-specific testing, security, or deployment guidance.
- When the user asks for a single bounded fix, use only the relevant phases and avoid creating a process exercise.
