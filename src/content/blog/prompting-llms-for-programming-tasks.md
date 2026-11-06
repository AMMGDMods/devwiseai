---
title: "A Practical Guide to Prompting LLMs for Programming Tasks"
description: "Learn a repeatable way to prompt large language models for coding, debugging, refactoring and tests, with templates you can copy today."
pubDate: 2026-11-06T09:00:00Z
category: tutorials
tags: ["prompting", "LLMs", "debugging", "refactoring", "AI coding assistants"]
author: "MIGOTEK Team"
---

Large language models (LLMs) can write, explain and fix code, but the quality of what you get back depends heavily on what you put in. A vague request like "fix my code" usually produces a vague answer. A clear request with the right context often produces something you can use almost immediately.

Prompting is not magic wording or secret tricks. For programming, it is mostly the same skill as writing a good bug report or a clear ticket for a teammate. This tutorial gives you a simple structure, shows it applied to the most common programming tasks, and ends with templates you can reuse.

## Why programming prompts fail

Most disappointing answers come from a few predictable gaps:

- **Missing context.** The model cannot see your project. It does not know your language version, framework, database or coding conventions unless you say so.
- **Unclear goal.** "Make this better" could mean faster, shorter, more readable or more secure. The model has to guess.
- **No constraints.** Without limits, models tend to add dependencies, restructure more than needed or rewrite code you wanted to keep.
- **No definition of done.** If you do not say what a correct result looks like, you cannot easily tell whether you got one.

Every technique below closes one of these gaps.

## The four-part structure: context, task, constraints, output

A reliable programming prompt has four parts. You will not always need all of them, but checking each one takes seconds.

1. **Context:** what the code is, where it runs and what surrounds it.
2. **Task:** exactly what you want done, in one or two sentences.
3. **Constraints:** what must stay the same and what must not be used.
4. **Output format:** what the answer should look like.

Here is the difference in practice. A weak prompt:

```text
Write a function to validate emails.
```

A stronger version:

```text
Context: Node.js 20 backend, TypeScript, we validate request bodies with Zod.
Task: Add validation for the "email" field in the signup schema below.
Constraints: Use Zod's built-in validators, no new dependencies.
Trim whitespace and lowercase the value before validation.
Output: Only the updated schema, then a short list of the cases it rejects.

<paste the existing schema here>
```

The second prompt is longer, but it removes almost all guessing. The answer will use your stack, fit your existing code and come back in a form that is quick to review.

## Give the model the right context (and only that)

Context is the biggest lever you have. Useful things to include:

- The **language and version**, and the main framework or library versions when they matter.
- The **relevant code**: the function you are changing, plus the types or interfaces it uses.
- **Error messages and stack traces**, copied exactly rather than paraphrased.
- **Examples** of input and expected output.

More is not always better, though. Pasting an entire repository buries the important part and can make answers less focused. Aim for the smallest set of code that a human would need to understand the problem. If the model asks about something you left out, add it.

Never paste secrets, credentials, private keys or real customer data. Replace them with placeholders like `API_KEY_HERE` or fake sample records.

## Applying the structure to common tasks

### Writing new code

Describe the behavior, not the implementation. Include the function signature you want, if you already know it, and a few examples.

```text
Write a Python function `slugify(title: str) -> str` for blog URLs.
Examples:
"Hello, World!" -> "hello-world"
"  AI   Tools 2026 " -> "ai-tools-2026"
"Café crème" -> "cafe-creme"
Use only the standard library. Include type hints and a docstring.
```

Examples are powerful because they define correctness more precisely than any description. They also give you instant test cases.

### Debugging

For bugs, give the model what you would give a colleague: what you expected, what actually happened, and the evidence.

```text
Expected: GET /orders returns the user's 20 most recent orders.
Actual: it returns orders from other users when the "page" parameter is set.
Error/log: none, the response is 200.
Code: <paste the handler and the query function>
What I've checked: the user ID from the session is correct.
Explain the most likely cause before suggesting a fix.
```

The last line matters. Asking for an explanation **before** a fix makes the model reason about the cause instead of jumping to a patch that hides the symptom. It also lets you judge whether the explanation is believable.

### Refactoring

Refactoring prompts need firm constraints, because the model's natural tendency is to change more than you asked.

```text
Refactor the function below to reduce nesting and improve readability.
Constraints:
- Keep the public function name, parameters and return type identical.
- Do not change behavior, including error messages.
- No new dependencies.
After the code, list every behavioral risk you can think of.
```

Asking for a list of risks gives you a review checklist and surfaces places where "pure refactoring" might accidentally change behavior.

### Writing tests

Be specific about the testing framework, the style and the cases you care about.

```text
Write pytest tests for the `apply_discount` function below.
Cover: normal discount, 0% and 100%, negative values, values over 100,
and rounding to 2 decimal places. Use parametrize where it makes sense.
Do not modify the function itself.
```

Then read the tests critically. A test suite that only checks the happy path, or that asserts whatever the current code returns, gives a false sense of safety.

### Explaining unfamiliar code

LLMs are excellent at explaining code, especially in a language or framework you know less well.

```text
Explain what this Bash script does, line by line, for a developer
who knows Python but not Bash. Point out anything that could be
dangerous to run, such as deleting files or using sudo.
```

## Iterate instead of starting over

Your first prompt rarely produces the final answer, and that is normal. Treat the conversation as a collaboration:

- **Point at the exact problem.** "The function fails when the list is empty; fix only that" works better than "it doesn't work".
- **Paste the new error** after trying the suggested fix, so the model sees what actually happened.
- **Ask it to check its own answer.** "Review your solution against the examples I gave. Do all of them pass?" often catches mistakes.
- **Restart when a conversation goes off track.** Long chats full of failed attempts can confuse the model. A fresh conversation with a clean, improved prompt is often faster.

## Ask for reasoning and alternatives

For design questions, do not just ask for "the answer". Ask for options and trade-offs:

```text
I need to cache API responses in a small Flask app with one server.
Give me two or three options, with the trade-offs of each
(complexity, memory use, behavior after a restart). Then recommend
one for my situation and explain why.
```

This turns the model into a sounding board instead of an oracle, and keeps the final decision with you, the person who knows the project.

## Break large tasks into a sequence of prompts

When a task is bigger than a single function, resist the urge to describe the whole thing in one giant prompt. Long, multi-part requests tend to produce long, multi-part answers in which some parts are thoughtful and others are rushed. Instead, run the work as a short sequence, where each step builds on a result you have already checked.

A typical sequence for a new feature might look like this:

1. **Plan.** "Here is the feature and the relevant files. Propose a step-by-step plan and list the files you would change. Don't write code yet."
2. **Agree on the plan.** Correct anything that does not fit your project, such as a library you don't use or a file that should not be touched.
3. **Implement one step at a time.** "Implement step 1 only." Review it, run it, commit it.
4. **Test.** "Write tests for what we built in steps 1 to 3."
5. **Review.** "Review the full change for edge cases and consistency with the plan."

This mirrors how experienced developers work anyway: think first, then build in small, verifiable pieces. It also makes mistakes cheap. If step 2 goes wrong, you only redo step 2, not the whole feature, and you always have a working state to return to.

## Know the limits

Even with excellent prompts, LLMs can be confidently wrong. Keep these limits in mind:

- **APIs can be invented or outdated.** Verify unfamiliar functions, flags and options in the official documentation.
- **Knowledge has a cutoff.** A model may not know about the latest release of a library unless your tool provides current documentation.
- **It cannot run your code** unless the tool explicitly supports execution. "This should work" is a prediction, not a test result.
- **Security needs human review.** Anything involving authentication, permissions, input handling or cryptography deserves careful checking.

Good prompting reduces these problems but does not remove them. Testing and review are still your job.

## Reusable prompt templates

Copy these and fill in the brackets.

**New code**

```text
Context: [language/version, framework, relevant libraries]
Task: Write [function/class] that [behavior].
Examples: [input -> expected output, 2-4 cases]
Constraints: [no new deps / must use X / performance limits]
Output: code only, then a short note on edge cases handled.
```

**Bug fix**

```text
Expected: [what should happen]
Actual: [what happens]
Error: [exact message and stack trace]
Code: [smallest relevant code]
Already tried: [what you checked]
Explain the likely cause first, then propose the smallest fix.
```

**Code review**

```text
Review the code below for bugs, edge cases, security issues and
readability. Don't rewrite it. Give a numbered list of issues,
most important first, with a one-line suggested fix for each.
[code]
```

## Summary

Prompting LLMs for programming comes down to clear communication. Give the model the context a teammate would need, state one specific task, set constraints so it does not wander, and say what a good answer looks like. Then iterate on the result, verify what it claims, and keep the final judgment for yourself. Do that consistently, and an LLM becomes one of the most useful tools in your development workflow.
