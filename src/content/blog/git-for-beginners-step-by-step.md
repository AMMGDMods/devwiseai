---
title: "Git for Beginners: A Step-by-Step Guide to Version Control"
description: "Learn Git from zero: install it, create a repository, commit, branch, merge, push to GitHub and undo mistakes, with every command explained."
pubDate: 2026-11-07T07:00:00Z
category: tutorials
tags: ["Git", "GitHub", "version control", "beginners", "command line"]
author: "MIGOTEK Team"
---

Git is the tool almost every software team uses to track changes to code. It lets you save snapshots of your project, go back to any earlier version, work on new features without breaking the main code, and collaborate with other people without overwriting each other's work.

It also has a reputation for being confusing. The good news is that you only need a small set of commands for everyday work, and once you understand what they do, the rest follows naturally. This guide walks you through that set, step by step, using a small practice project.

## What Git actually does

Think of Git as a series of saved snapshots of a folder. Each snapshot is called a **commit**. A commit records exactly what every tracked file looked like at that moment, along with a message explaining why the change was made.

Three places matter in Git:

- **The working directory:** the files you see and edit.
- **The staging area:** the changes you have marked to go into the next commit.
- **The repository:** the history of all commits, stored in a hidden `.git` folder.

The everyday rhythm is simple: you edit files, you **stage** the changes you want, and you **commit** them. That is most of Git.

**Git is not GitHub.** Git is the version control tool that runs on your computer. GitHub (like GitLab or Bitbucket) is a website that hosts Git repositories online so you can back them up and share them.

## Step 1: Install Git

Check whether Git is already installed:

```bash
git --version
```

If you see a version number, you are ready. If not:

- **Windows:** download the installer from the official site, git-scm.com. It includes Git Bash, a terminal where all the commands in this guide work.
- **macOS:** run `git --version` in Terminal; if Git is missing, macOS offers to install the Command Line Developer Tools, which include it. You can also use Homebrew: `brew install git`.
- **Linux (Debian/Ubuntu):** `sudo apt install git`.

## Step 2: Tell Git who you are

Every commit records an author. Set your name and email once:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

It is also worth making `main` the default name for new branches:

```bash
git config --global init.defaultBranch main
```

You can review your settings at any time with `git config --list`.

## Step 3: Create your first repository

Make a folder for a practice project and turn it into a Git repository:

```bash
mkdir my-first-repo
cd my-first-repo
git init
```

`git init` creates the hidden `.git` folder. Nothing is tracked yet. Create a file:

```bash
echo "# My First Repo" > README.md
```

Now ask Git what it sees:

```bash
git status
```

Git reports `README.md` as an **untracked file**: it exists, but Git is not tracking it yet. Get into the habit of running `git status` often; it is the command that tells you where you are.

## Step 4: Stage and commit

Stage the file, then commit it:

```bash
git add README.md
git commit -m "Add README"
```

To stage every changed file in the current folder at once, use `git add .` (the dot means "this folder"). It is convenient, but check `git status` first so you do not commit something by accident.

A good commit message says *why*, briefly: "Fix login redirect loop" is useful six months from now; "changes" is not.

Now edit the file and look at the difference before staging:

```bash
echo "A project for learning Git." >> README.md
git diff
```

`git diff` shows unstaged changes line by line. After `git add`, use `git diff --staged` to see what is about to be committed. Commit the change:

```bash
git add README.md
git commit -m "Describe the project in README"
```

## Step 5: Look at your history

```bash
git log
```

This lists commits, newest first, each with a long ID (a hash), the author, the date and the message. A compact view is often easier to read:

```bash
git log --oneline
```

Press `q` to exit the log if it opens in a pager.

## Step 6: Ignore files that should not be tracked

Some files never belong in a repository: dependencies you can reinstall, build output, editor settings and, above all, secrets such as passwords and API keys. List them in a file named `.gitignore`:

```bash
# .gitignore
node_modules/
dist/
.env
*.log
.DS_Store
```

Commit the `.gitignore` itself so everyone on the project shares it. Note that it only affects files that are not already tracked. If you committed a secret by mistake, ignoring it now does not remove it from history, so change that password or key right away.

## Step 7: Work on a branch

A **branch** is an independent line of work. You create one for each feature or fix, so the `main` branch always stays in a working state.

```bash
git switch -c add-contact-info
```

This creates a branch called `add-contact-info` and switches to it. (Older tutorials use `git checkout -b`, which does the same thing.) Make a change and commit it:

```bash
echo "Contact: you@example.com" >> README.md
git add README.md
git commit -m "Add contact info"
```

List branches with `git branch`; the current one is marked with an asterisk. Switch back to main:

```bash
git switch main
```

Look at `README.md` now: the contact line is gone, because it only exists on the other branch. Nothing is lost; it is just not part of `main` yet.

## Step 8: Merge your branch

When the work on a branch is done, bring it into `main`:

```bash
git switch main
git merge add-contact-info
```

Then delete the branch you no longer need:

```bash
git branch -d add-contact-info
```

### When a merge conflict happens

If two branches changed the same lines differently, Git cannot decide which version wins and stops with a **merge conflict**. The file will contain markers like this:

```text
<<<<<<< HEAD
Contact: team@example.com
=======
Contact: you@example.com
>>>> add-contact-info
```

The part above `=======` is your current branch; the part below is the branch you are merging. Edit the file so it contains the version you want, delete the marker lines, then finish the merge:

```bash
git add README.md
git commit
```

Git opens your editor with a prepared merge message; save and close it to complete the merge. Conflicts look scary the first time, but they are just Git asking you a question it cannot answer on its own.

## Step 9: Put your repository on GitHub

Create a new, empty repository on GitHub (without a README, so the histories do not clash). GitHub shows you its URL. Connect your local repository to it and push:

```bash
git remote add origin https://github.com/your-username/my-first-repo.git
git push -u origin main
```

`origin` is the conventional nickname for the main remote. The `-u` flag remembers that your local `main` tracks `origin/main`, so next time you can simply run `git push`.

GitHub no longer accepts your account password for Git over HTTPS. Sign in through the browser prompt that Git Credential Manager shows, use a personal access token, or set up SSH keys.

To get changes that others pushed (or that you pushed from another computer):

```bash
git pull
```

To copy an existing repository to your machine:

```bash
git clone https://github.com/your-username/my-first-repo.git
```

## Step 10: Undo mistakes safely

Everyone makes mistakes in Git. These commands cover the most common ones:

```bash
# Discard unstaged changes to a file (cannot be undone)
git restore README.md

# Unstage a file but keep your changes
git restore --staged README.md

# Fix the message of your last commit (before you push it)
git commit --amend -m "Better message"

# Undo a commit that is already pushed, by adding a new commit that reverses it
git revert <commit-id>
```

A simple rule keeps you safe: **never rewrite history that you have already pushed and others may have pulled.** Use `git revert` for shared commits. Commands like `git reset --hard` and `git push --force` permanently discard work, so avoid them until you understand exactly what they do.

## A daily workflow you can follow

Once the basics click, most days look like this:

1. `git switch main` and `git pull` to start from the latest code.
2. `git switch -c my-feature` to start a branch.
3. Edit, then `git status`, `git diff`, `git add` and `git commit`, in small steps.
4. `git push -u origin my-feature` and open a pull request on GitHub.
5. After review, merge it, then delete the branch.

Small, frequent commits with clear messages make every later step easier: reviewing, finding bugs and undoing changes.

## Git and AI tools

Git becomes even more important when you use AI coding assistants. Commit before you ask an assistant to change your code, and you can see exactly what it did with `git diff`, or throw it all away with `git restore .`. Our guide to [using AI coding assistants without writing worse code](/blog/ai-coding-assistants-without-worse-code/) builds on exactly this habit, and if you want help remembering a command, an assistant is good at explaining Git as long as you [prompt it with your exact situation](/blog/prompting-llms-for-programming-tasks/).

## Quick reference

```bash
git init                      # start a repository
git status                    # what changed?
git add <file>                # stage a change
git commit -m "message"       # save a snapshot
git log --oneline             # view history
git switch -c <branch>        # create and switch to a branch
git merge <branch>            # merge a branch into the current one
git push / git pull           # sync with the remote
git restore <file>            # discard changes to a file
git revert <commit-id>        # safely undo a pushed commit
```

Practice these on a throwaway project until they feel routine. After a week of real use, Git stops being a mystery and becomes the safety net you will not want to work without.
