---
title: "Build a REST API with Node.js and Express: CRUD, Validation and Error Handling"
description: "A step-by-step tutorial for building a working REST API in Node.js with Express 5: CRUD routes, input validation, proper status codes and central error handling."
pubDate: 2026-11-06T14:00:00Z
category: tutorials
tags: ["Node.js", "Express", "REST API", "JavaScript", "backend"]
author: "MIGOTEK Team"
---

A REST API is one of the first real backend projects most developers build, and it is a great way to learn how web servers work. In this tutorial you will build a small but complete API for managing tasks with Node.js and Express. It supports the four CRUD operations (create, read, update, delete), validates input, returns correct HTTP status codes and handles errors in one place.

Every request shown in this guide was run against the finished code. By the end you will have a single file you can extend into a real project.

## What you will build

A "tasks" API with these endpoints:

- `GET /tasks`: list all tasks
- `GET /tasks/:id`: get one task
- `POST /tasks`: create a task
- `PATCH /tasks/:id`: update part of a task
- `DELETE /tasks/:id`: delete a task

Each task looks like this:

```json
{
  "id": "9232b8ab-3179-413b-9d82-e608cf6a70c6",
  "title": "Write the first post",
  "done": false,
  "createdAt": "2026-11-06T23:13:13.391Z",
  "updatedAt": "2026-11-06T23:13:13.391Z"
}
```

To keep the focus on the API itself, tasks are stored in memory. That means the data disappears when the server restarts, which is fine for learning. At the end we look at what changes when you add a real database.

## Prerequisites

- **Node.js 20 or newer.** Check with `node --version`.
- A terminal and a code editor.
- Basic JavaScript knowledge: functions, objects, arrays and `async`/`await`.
- `curl` for testing (it ships with macOS, Linux and current versions of Windows), or any API client you prefer.

## Step 1: Set up the project

Create a folder, initialize a project and install Express:

```bash
mkdir tasks-api
cd tasks-api
npm init -y
npm install express
```

At the time of writing, `npm install express` installs Express 5, which is what this tutorial uses. You can confirm the version in `package.json` after installing.

Open `package.json` and add `"type": "module"` so you can use modern `import` syntax, plus two scripts. It should look roughly like this:

```json
{
  "name": "tasks-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

Keep whatever version `npm install` wrote into `dependencies`. The `dev` script uses Node's built-in `--watch` flag, which restarts the server whenever you save a file, so you do not need an extra tool for that.

## Step 2: Create the server and the data store

Create a file named `server.js`. Start with the basics:

```js
import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
app.use(express.json());

// In-memory "database": fine for learning, lost on every restart.
const tasks = new Map();
```

`express.json()` is middleware that reads JSON request bodies and puts the parsed result on `req.body`. Without it, `req.body` would be `undefined` for every request.

We use a `Map` as our store, keyed by task ID. It gives fast lookups and simple deletes, and its API (`get`, `set`, `delete`) is close to what you would do with a real database. IDs come from `randomUUID()` in Node's built-in `crypto` module, so there is nothing extra to install.

## Step 3: Define a custom error type

Good APIs fail in predictable ways. Instead of building error responses in every route, we throw an error that carries an HTTP status, and let one handler format the response:

```js
// Turn a problem into an error the error handler understands.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
```

The optional `details` field lets validation errors list every problem at once, which is far friendlier to API clients than reporting one problem per request.

## Step 4: Validate input

Never trust request bodies. A client might send the wrong types, missing fields, extra fields or no JSON at all. This function checks a task payload and throws a `422 Unprocessable Content` error listing everything that is wrong:

```js
// Validate a task payload. `partial` is true for PATCH, where every field is optional.
function validateTask(body, { partial = false } = {}) {
  const errors = [];

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  const allowed = ['title', 'done'];
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) errors.push(`Unknown field: ${key}`);
  }

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push('title is required and must be a non-empty string');
    } else if (body.title.length > 200) {
      errors.push('title must be 200 characters or fewer');
    }
  }

  if (body.done !== undefined && typeof body.done !== 'boolean') {
    errors.push('done must be true or false');
  }

  if (partial && Object.keys(body).length === 0) {
    errors.push('Provide at least one field to update');
  }

  if (errors.length > 0) {
    throw new HttpError(422, 'Validation failed', errors);
  }
}
```

A few decisions worth noticing:

- **Unknown fields are rejected.** This stops clients from setting fields like `id` or `createdAt` themselves, and catches typos such as `titel`.
- **`partial` mode** supports `PATCH`, where a client may send only the fields it wants to change.
- **Types are checked strictly.** The string `"yes"` is not a boolean, and a title of only spaces is treated as empty.

For larger projects, a schema validation library such as Zod or Joi saves a lot of repetitive code, but writing validation by hand once is the best way to understand what those libraries do for you.

## Step 5: Add the CRUD routes

First, a small helper that finds a task or throws a 404:

```js
function findTask(id) {
  const task = tasks.get(id);
  if (!task) throw new HttpError(404, `Task ${id} not found`);
  return task;
}
```

Now the five routes:

```js
// READ all
app.get('/tasks', (req, res) => {
  res.json([...tasks.values()]);
});

// READ one
app.get('/tasks/:id', (req, res) => {
  res.json(findTask(req.params.id));
});

// CREATE
app.post('/tasks', (req, res) => {
  validateTask(req.body);
  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title: req.body.title.trim(),
    done: req.body.done ?? false,
    createdAt: now,
    updatedAt: now,
  };
  tasks.set(task.id, task);
  res.status(201).location(`/tasks/${task.id}`).json(task);
});

// UPDATE (partial)
app.patch('/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  validateTask(req.body, { partial: true });
  if (req.body.title !== undefined) task.title = req.body.title.trim();
  if (req.body.done !== undefined) task.done = req.body.done;
  task.updatedAt = new Date().toISOString();
  res.json(task);
});

// DELETE
app.delete('/tasks/:id', (req, res) => {
  findTask(req.params.id);
  tasks.delete(req.params.id);
  res.status(204).end();
});
```

Notice how short each route is. Validation and lookups are delegated to helpers, and errors are thrown rather than handled inline. Each route uses the status code that matches what happened:

- **200 OK** for successful reads and updates.
- **201 Created** for a new task, with a `Location` header pointing to it.
- **204 No Content** for a successful delete, which has no response body.

Using `PATCH` for updates means clients can send just `{"done": true}` without repeating the title. If you prefer `PUT`, the convention is that the client sends the complete resource, so you would call `validateTask(req.body)` without `partial`.

## Step 6: Handle errors in one place

Add these two handlers at the end of the file, after all routes:

```js
// Anything that did not match a route above
app.use((req, res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.path} not found`));
});

// Central error handler: Express recognises it by its four arguments.
app.use((err, req, res, next) => {
  // Malformed JSON from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }

  const status = err.status ?? 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message,
    ...(err.details && { details: err.details }),
  });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
```

The first handler catches any request that did not match a route and turns it into a 404. The second is Express's error-handling middleware. Express recognizes it because it takes **four arguments**, so keep the unused `next` parameter even though the function does not call it.

The error handler does three jobs:

1. **Malformed JSON** from `express.json()` becomes a clear 400 instead of a confusing stack trace.
2. **Errors we threw on purpose** (`HttpError`) are returned with their status, message and details.
3. **Unexpected errors** are logged on the server, but the client only sees a generic "Internal server error". Leaking stack traces or internal messages to clients is a security risk.

In Express 5, errors thrown inside route handlers, including rejected promises from `async` handlers, are passed to this error handler automatically. That matters as soon as you add a database, because database calls are asynchronous.

## Step 7: Run and test the API

Start the server:

```bash
npm run dev
```

In another terminal, create a task:

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write the first post"}'
```

You should see `HTTP/1.1 201 Created`, a `Location` header and the new task in JSON. Copy its `id` and try the other operations, replacing `TASK_ID`:

```bash
# List all tasks
curl http://localhost:3000/tasks

# Get one task
curl http://localhost:3000/tasks/TASK_ID

# Mark it as done
curl -X PATCH http://localhost:3000/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"done": true}'

# Delete it (returns 204 with no body)
curl -i -X DELETE http://localhost:3000/tasks/TASK_ID
```

Now test the failure cases, because they are just as important:

```bash
# Missing title -> 422
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" -d '{}'

# Wrong type and unknown field -> 422 with two details
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "x", "done": "yes", "color": "red"}'

# Broken JSON -> 400
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" -d '{bad json'

# Unknown task -> 404
curl http://localhost:3000/tasks/does-not-exist
```

The second request returns:

```json
{
  "error": "Validation failed",
  "details": ["Unknown field: color", "done must be true or false"]
}
```

That is exactly the kind of response that makes an API pleasant to use: the client learns everything that is wrong in one round trip.

## The complete file

Here is the full `server.js` in one piece:

```js
import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
app.use(express.json());

// In-memory "database": fine for learning, lost on every restart.
const tasks = new Map();

// Turn a problem into an error the error handler understands.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Validate a task payload. `partial` is true for PATCH, where every field is optional.
function validateTask(body, { partial = false } = {}) {
  const errors = [];

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  const allowed = ['title', 'done'];
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) errors.push(`Unknown field: ${key}`);
  }

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push('title is required and must be a non-empty string');
    } else if (body.title.length > 200) {
      errors.push('title must be 200 characters or fewer');
    }
  }

  if (body.done !== undefined && typeof body.done !== 'boolean') {
    errors.push('done must be true or false');
  }

  if (partial && Object.keys(body).length === 0) {
    errors.push('Provide at least one field to update');
  }

  if (errors.length > 0) {
    throw new HttpError(422, 'Validation failed', errors);
  }
}

function findTask(id) {
  const task = tasks.get(id);
  if (!task) throw new HttpError(404, `Task ${id} not found`);
  return task;
}

// READ all
app.get('/tasks', (req, res) => {
  res.json([...tasks.values()]);
});

// READ one
app.get('/tasks/:id', (req, res) => {
  res.json(findTask(req.params.id));
});

// CREATE
app.post('/tasks', (req, res) => {
  validateTask(req.body);
  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title: req.body.title.trim(),
    done: req.body.done ?? false,
    createdAt: now,
    updatedAt: now,
  };
  tasks.set(task.id, task);
  res.status(201).location(`/tasks/${task.id}`).json(task);
});

// UPDATE (partial)
app.patch('/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  validateTask(req.body, { partial: true });
  if (req.body.title !== undefined) task.title = req.body.title.trim();
  if (req.body.done !== undefined) task.done = req.body.done;
  task.updatedAt = new Date().toISOString();
  res.json(task);
});

// DELETE
app.delete('/tasks/:id', (req, res) => {
  findTask(req.params.id);
  tasks.delete(req.params.id);
  res.status(204).end();
});

// Anything that did not match a route above
app.use((req, res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.path} not found`));
});

// Central error handler: Express recognises it by its four arguments.
app.use((err, req, res, next) => {
  // Malformed JSON from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }

  const status = err.status ?? 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message,
    ...(err.details && { details: err.details }),
  });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
```

## Where to go next

This API is intentionally small, but its structure scales. Here is what to add as it grows, roughly in order:

- **A real database.** Replace the `Map` with PostgreSQL, MySQL, SQLite or MongoDB. Make the route handlers `async`, `await` the database calls, and Express 5 forwards any failures to your error handler. Always use parameterized queries, never string concatenation.
- **Split the code into modules.** Move routes into an `express.Router()` in `routes/tasks.js`, and validation into its own file.
- **Pagination.** `GET /tasks` returning everything is fine for ten tasks and a problem for ten thousand. Accept `limit` and `offset` (or a cursor) query parameters.
- **Authentication.** Protect write operations so only authorized users can change data.
- **Automated tests.** Use Node's built-in test runner (`node --test`) together with an HTTP testing library to check every status code you tested by hand above.
- **Security headers and rate limiting.** Packages such as `helmet` and `express-rate-limit` cover common needs for public APIs.

## Using AI to extend this project

An AI assistant can help you add any of these features quickly. Give it this file as context, ask for one change at a time, and review the result carefully: check that new status codes are correct, that validation still rejects bad input, and that errors still flow through the central handler. Our [checklist for reviewing AI-generated code](/blog/how-to-review-ai-generated-code/) covers exactly what to look for, and our guide to [prompting LLMs for programming tasks](/blog/prompting-llms-for-programming-tasks/) shows how to ask for changes that fit your existing code.

Keep the project in Git as you go. If you are new to it, start with our [Git guide for beginners](/blog/git-for-beginners-step-by-step/).
