# No Štokel — Association for Good Friendship

A website for the **No Štokel** association, dedicated to promoting genuine, respectful friendship.

## What is Štokel?

"Štokel" describes the behaviours that have no place between true friends:

- Using personal things someone told you in confidence to mock them
- Laughing or ridiculing a friend when something goes wrong in their life
- Disturbing others through unnecessary screaming or noise
- Passive-aggressive blame — veiled jabs wrapped in plausible deniability
- Making a friend feel personally targeted during a fair, shared accountability check
- Judging how a friend lives when their choices are not yours to make
- Talking about a friend behind their back
- Reducing a woman to her body — treating her as an object rather than a full human being

## What Good Friendship Looks Like

The positive counterpart to every Štokel behaviour:

- Trust & confidentiality — what is shared in confidence stays there
- Support in hard times — show up, don't laugh
- Respect for everyone — be mindful of the space around you
- Fair accountability — being checked is not being attacked
- Speak directly — say what you mean, to someone's face
- Accept, don't judge — share your view once, then let them be
- What's said here, stays here — loyalty ends the conversation with you
- Respect for women — her mind, her character, and her choices matter as much as anyone else's

## How It Works

The site is a static HTML/CSS/JS frontend deployed on **Cloudflare Pages**, with serverless backend logic via **Cloudflare Pages Functions**.

### Pledge System

Visitors can sign a pledge to reject Štokel behaviour. The pledge form:

1. Collects a name and optional message.
2. Validates the submission with a **Cloudflare Turnstile** widget (bot protection).
3. POSTs to `/api/pledge` (a Pages Function in `functions/api/pledge.js`), which verifies the Turnstile token server-side and inserts the record into a **Cloudflare D1** SQLite database.
4. The wall of pledges is loaded dynamically on page load via a GET to the same `/api/pledge` endpoint.

### Admin Page

`/admin.html` provides a simple interface to review and delete pledges. It is protected by **HTTP Basic Auth** — credentials are stored as environment variables (`ADMIN_USER`, `ADMIN_PASS`) in Cloudflare Pages and never exposed to the client.

## Structure

```
nostokel/
├── index.html                      # Main page
├── admin.html                      # Admin pledge management
├── style.css                       # Styles
├── main.js                         # Pledge form + wall loading
├── schema.sql                      # D1 database schema
├── wrangler.toml                   # Cloudflare config (D1 binding)
├── NO STOKEL.png                   # Logo
├── favicon.ico                     # Browser tab icon
└── functions/
    └── api/
        ├── pledge.js               # GET (list pledges) / POST (create pledge)
        └── admin/
            └── pledges.js          # GET (all pledges) / DELETE (remove by id)
```

## Deployment

The site is deployed on **Cloudflare Pages**, connected to this GitHub repository. Every push to `main` triggers an automatic deployment. No build step is needed — the build command is left empty and the output directory is `/`.

### Required environment variables (set in Cloudflare Pages dashboard)

| Variable           | Purpose                                      |
|--------------------|----------------------------------------------|
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret key (bot check)  |
| `ADMIN_USER`       | Username for the admin page                  |
| `ADMIN_PASS`       | Password for the admin page                  |

### D1 database

The database is named `nostokel-pledges`. Apply the schema once with:

```sh
npx wrangler d1 execute nostokel-pledges --remote --file=schema.sql
```

## Running locally

Just open `index.html` in any browser for the static content. To test the pledge API locally, run:

```sh
npx wrangler pages dev . --d1 DB=<your-d1-database-id>
```
