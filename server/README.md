# OpenViz Team Server (optional)

OpenViz Studio is local-first and works fully without this server. The Team Server adds the things a single browser cannot do on its own:

- **Hosted links you can update in place.** Publish a chart or dashboard and get a URL such as `https://charts.example.org/p/Ab3…`. Publishing again replaces the content at the **same URL**, so existing embeds update automatically. The last 20 versions are kept and can be viewed (`/p/<id>/v/<n>`) or restored.
- **Shared projects.** Share a project, and teammates open it from *File → Open team project*. *File → Sync with team* uses revision numbers: if someone else saved a newer version while you had unsynced changes, OpenViz asks whether to use theirs, keep yours as a separate copy, or overwrite. Nothing is silently lost, and the last 20 revisions stay on the server.
- **Comments** on charts (Settings → Team comments) with resolve/reopen, plus a team **activity log**.
- **The app itself** at `/app/`, so a team can use one shared installation.

Live publications (Publishing Studio → Content mode → *Live*) work both hosted here and as downloaded files. They refresh from their live data link in the reader's browser.

## Run it

Requires Node.js 18 or later. There are no dependencies to install.

```bash
node server/openviz-server.mjs
```

On first run it creates `openviz-data/tokens.json` with an **Admin** access token and prints it. Add members by editing that file and restarting:

```json
{"Admin":"…","Aroha":"a-long-random-token","Sam":"another-long-random-token"}
```

In OpenViz, choose *File → Team server…*, enter the address (for example `http://localhost:8787`) and your token, then *Test & save*.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8787` | Listening port |
| `HOST` | `127.0.0.1` | Use `0.0.0.0` to share on your network |
| `DATA_DIR` | `./openviz-data` | Where publications, projects, comments and tokens are stored (plain JSON files) |
| `PUBLIC_URL` | (request host) | Base URL used in the links the server returns, e.g. `https://charts.example.org` |
| `OPENVIZ_TOKENS` | (tokens.json) | `Name:token,Name2:token2`; overrides tokens.json |
| `SCHEDULED_REFRESH` | off | `1` turns on scheduled live-data refresh (below) |
| `REFRESH_ALLOW_PRIVATE` | off | `1` lets scheduled refresh fetch `http://` and private-network addresses. For testing only; never set this on an internet-facing server |

## Scheduled live-data refresh (optional)

Live datasets normally refresh in the browser, and only while someone has the project open. With `SCHEDULED_REFRESH=1`, the server also refreshes live datasets in **shared projects** when the dataset's owner has ticked *Also refresh on the team server when nobody has OpenViz open* (*Data → Live link settings*). Nothing is fetched for datasets that have not opted in.

- The server checks every minute and fetches each opted-in dataset on the schedule set in its live link settings.
- When the data changes, the server saves a new project revision as **Scheduled refresh**, re-applies calculated fields, and records it in the activity log. If nothing changed, no revision is saved.
- If the source drops a column, the server keeps the current rows and records the error so a person can review it. This matches the in-app behaviour.
- A teammate with unsynced edits does not get a conflict because of a scheduled refresh. On *Sync with team*, OpenViz merges the refreshed rows into the local copy and then saves. A conflict is raised only when a person saved first.
- `POST /api/projects/:id/refresh` runs a refresh immediately.
- **Safety:** only `https://` links are fetched. Every resolved address is checked when the connection is made, and private, loopback, link-local and other internal ranges are refused, which also covers DNS rebinding. Redirects are checked the same way. Requests time out after 20 seconds, size is capped at 20 MB, and no cookies or credentials are sent.
- To keep hosted dashboards current, publish them as *Live* publications that read the same source, or re-publish from the refreshed project.

## Publishing on the internet

Put the server behind an HTTPS reverse proxy (Caddy, nginx, a cloud load balancer) and set `PUBLIC_URL`. The app refuses non-HTTPS server addresses outside a local network. Back up `DATA_DIR` regularly. It is plain files, so ordinary file backups work.

## Security model

- **Access:** every API call needs a bearer token. Tokens are compared in constant time. Published pages (`/p/…`) are public by design: anyone with the link can view them.
- **Isolation:** published HTML is served with `Content-Security-Policy: sandbox allow-scripts …` and without `allow-same-origin`, so a published page runs in a unique opaque origin and cannot call the API or read other pages.
- **Limits and safety:**
  - request bodies are limited to 32 MB
  - IDs are validated
  - writes are atomic (temporary file and rename) and serialised per file
  - simple per-IP rate limiting is applied
  - static files are restricted to the app (no `server/`, `tests/`, `tools/` or data files)
- **Not included:** user accounts with passwords or SSO, per-project permissions, and real-time co-editing. Every member can read and write every shared project, so run one server per team that should share everything.

## API summary

All routes except `/api/health` require `Authorization: Bearer <token>`.

| Method and path | Purpose |
|---|---|
| `GET /api/me` | Check your token (also reports whether scheduled refresh is on) |
| `GET/POST /api/publications` | List, or create a publication from `{title, kind, html}` |
| `GET/PUT/DELETE /api/publications/:id` | Read metadata, update in place (same URL), or unpublish |
| `POST /api/publications/:id/restore/:n` | Restore an earlier version |
| `GET /api/projects` | List shared projects |
| `GET/PUT/DELETE /api/projects/:id` | Read, save, or delete a project. A save sends `{project, baseRevision}` and gets 409 if it is stale; `force: true` overwrites |
| `GET/POST /api/projects/:id/comments` | List, or add `{text, target}` |
| `PATCH /api/projects/:id/comments/:cid` | Set `{resolved}` |
| `GET /api/activity` | Latest 100 events |
| `GET /p/:id` and `/p/:id/v/:n` | Public published page, latest or a specific version |
| `POST /api/projects/:id/refresh` | Run the scheduled live-data refresh for one project now (when `SCHEDULED_REFRESH=1`) |
