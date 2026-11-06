---
title: "How to Review AI-Generated Code: A Practical Checklist"
description: "A step-by-step checklist for reviewing code written by AI assistants: correctness, invented APIs, security, dependencies, tests and maintainability."
pubDate: 2026-11-06T16:00:00Z
category: dev-productivity
tags: ["code review", "AI coding assistants", "code quality", "security", "checklist"]
author: "MIGOTEK Team"
---

AI assistants have changed where developers spend their time. Writing the first version of a function is now fast. Deciding whether that function is actually correct, safe and maintainable is not, and that decision still belongs to you.

Reviewing AI-generated code is different from reviewing a colleague's pull request in one important way: the code arrives with no author you can ask, no history of decisions, and a confident tone whether it is right or wrong. The model is not trying to deceive you, but it is optimized to produce code that *looks* plausible, and plausible bugs are the hardest kind to catch.

This guide gives you a repeatable review process and a checklist you can copy into your team's pull request template. It complements our broader guide on [using AI coding assistants without writing worse code](/blog/ai-coding-assistants-without-worse-code/), which focuses on the workflow before and around generation.

## Before you read a single line

Two quick steps make the rest of the review faster and more reliable.

**1. Restate the requirement in your own words.** Write one or two sentences describing what the code should do, including the edge cases. If you cannot do that, you cannot judge the code. Many bad AI changes are not buggy; they correctly solve the wrong problem.

**2. Look at the size and shape of the diff.** Run `git diff --stat` and check which files changed. Ask:

- Did it touch files that have nothing to do with the task?
- Is the change much larger than the problem deserves?
- Did it delete or rewrite code you did not ask it to change?

A focused diff is reviewable. A sprawling one should be split, or regenerated with a narrower request, before you invest time in it. A clear prompt helps here; see our [guide to prompting LLMs for programming tasks](/blog/prompting-llms-for-programming-tasks/).

## Pass 1: Does it do the right thing?

Start with behavior, not style.

- **Trace the main path by hand.** Pick a realistic input and follow it through the code. Does the output match what you expected?
- **Check the boundaries.** Empty arrays, empty strings, `null` and `undefined`, zero, negative numbers, very large inputs, duplicate values, Unicode text, time zones and daylight saving changes. Assistants tend to handle the example in the prompt and miss the cases around it.
- **Check the failure paths.** What happens when the network call fails, the file does not exist, or the database returns nothing? Is the error reported, retried, or silently swallowed?
- **Look for quietly changed behavior.** In refactors especially, compare old and new logic carefully. A reordered condition or a changed default can alter behavior without any test failing.

## Pass 2: Does everything it uses actually exist?

This is the failure mode most specific to AI-written code. Models sometimes produce function names, options, configuration keys or packages that sound right but do not exist, or that existed in a different version of a library.

- **Verify every unfamiliar API call** against the official documentation for the exact version in your lock file, not the latest version and not a blog post.
- **Check every new dependency.** Confirm the package exists on the official registry, is the one you think it is, is actively maintained, and has a license you can use. Be especially careful with names that are close to popular packages: attackers register look-alike names, and a hallucinated package name is exactly the kind of thing someone may have registered.
- **Question whether a dependency is needed at all.** Assistants often reach for a library to do something your language's standard library already handles in a few lines.
- **Run it.** The fastest way to discover an invented method is to execute the code. Type checkers and linters catch many of these before runtime.

## Pass 3: Is it secure?

Treat security review as mandatory, not optional, because generated code often reproduces insecure patterns that are common in public examples.

- **Input handling:** Is every external input (request bodies, query strings, headers, file uploads, environment variables) validated before use?
- **Injection:** Are SQL queries parameterized? Is user input ever passed to a shell command, `eval`, a template without escaping, or a file path?
- **Authentication and authorization:** Does the new endpoint or function check that the caller is allowed to do this, not just that they are logged in?
- **Secrets:** Are there hard-coded keys, tokens, passwords or example credentials? Are secrets written to logs or error messages?
- **Unsafe shortcuts:** Disabled TLS verification, overly permissive CORS settings, broad file permissions, or debug modes left on.
- **Data exposure:** Do error responses or API outputs include internal details, stack traces or fields the client should not see?

If the change touches authentication, payments, personal data or permissions, get a second human reviewer regardless of how clean it looks.

## Pass 4: Are the tests real?

AI assistants are good at producing tests, and that is genuinely useful. They are also capable of producing tests that pass without proving anything.

- **Read the assertions.** A test that only checks that a function "returns something" or "does not throw" verifies very little.
- **Check that tests can fail.** Temporarily break the implementation, for example by flipping a condition, and confirm that at least one test goes red. If nothing fails, the tests are not protecting you.
- **Watch for tests rewritten to match the code.** If an assistant changed an existing test's expected value to make it pass, find out whether the old expectation was wrong or the new code is.
- **Look for over-mocking.** When everything is mocked, the test only checks that the code calls the mocks in a certain order.
- **Make sure the edge cases from Pass 1 are covered.** If you found a boundary worth checking by hand, it is worth a test.

## Pass 5: Will your team be able to maintain it?

Correct code can still be the wrong code for your project.

- **Consistency:** Does it follow your project's conventions for naming, error handling, logging, folder structure and existing helper functions? Generated code often reinvents a utility that already exists in your codebase.
- **Simplicity:** Is there unnecessary abstraction, configuration or generality for a problem that is simple today? Extra layers are a cost every future reader pays.
- **Readability:** Could a teammate understand this without asking you? If you needed the assistant to explain it to you, consider whether it should be rewritten more plainly.
- **Comments:** Remove comments that just restate the code, and make sure any remaining comments are accurate. Outdated or wrong comments are worse than none.
- **Dead code:** Delete unused imports, variables, parameters and leftover debugging statements.

## Pass 6: Performance and resource use

You do not need to optimize everything, but watch for patterns that will hurt at real scale:

- Database queries inside loops (the classic "N+1" problem).
- Loading an entire table or file into memory when you only need part of it.
- Missing pagination on endpoints that return lists.
- Nested loops over large collections where a map or set lookup would do.
- Missing timeouts on network calls, or retries without limits or backoff.

## Use the assistant as a second reviewer, not the only one

An AI tool can help review, too. Ask it to look for edge cases, security problems or race conditions in a specific function, or to explain a block of code you find confusing. Ask a fresh session rather than the one that wrote the code, and give it the requirement, not just the code. Treat its answers as leads to investigate, not verdicts. The final judgment, and the responsibility for what ships, stays with a person.

## The copy-paste checklist

Use this as a pull request template or a personal routine:

```text
AI-generated code review checklist

Scope
[ ] I can state the requirement and edge cases in my own words
[ ] The diff only touches files related to the task
[ ] The change is small enough to review line by line

Correctness
[ ] Main path traced by hand with realistic input
[ ] Boundaries checked: empty, null, zero, large, duplicates, time zones
[ ] Failure paths report errors instead of hiding them
[ ] No unintended behavior change in refactored code

Existence
[ ] Every unfamiliar API checked against docs for our version
[ ] Every new dependency verified: real, maintained, licensed, needed
[ ] Code runs; type checker and linter pass

Security
[ ] All external input validated
[ ] No injection risks (SQL, shell, templates, file paths)
[ ] Authorization checked, not just authentication
[ ] No secrets in code, logs or error messages
[ ] No disabled security settings

Tests
[ ] Assertions check real behavior
[ ] Tests fail when the implementation is broken
[ ] Existing tests were not weakened to pass
[ ] Edge cases are covered

Maintainability
[ ] Follows project conventions and reuses existing helpers
[ ] No unnecessary abstraction, dead code or misleading comments
[ ] A teammate could understand it without asking

Performance
[ ] No queries in loops, unbounded lists, or missing timeouts
```

## Make it a habit, not an event

The checklist looks long, but most items take seconds once they become routine, and small diffs make every pass faster. Teams that get the most from AI assistants are not the ones that review less. They are the ones that review consistently, keep changes small, and treat generated code with the same standards as any other code.

If you are still choosing which tools to bring into this workflow, our overview of the [best AI extensions for VS Code](/blog/best-ai-extensions-for-vs-code/) and our guide on [choosing an AI code assistant](/blog/choosing-an-ai-code-assistant-2026/) are good next reads.
