PRD: VideoDB Meme Templates Site (Code-First Meme Generator)

1) Product summary

A web app that lets anyone generate “instant memes” (short videos) from reusable VideoDB Editor templates.

Users:

* pick a template from a library
* paste their VideoDB API Key
* swap in their own VideoDB asset IDs (video/image/audio) + text inputs
* click Run
* get an instant playable stream URL generated via VideoDB Editor (no manual timeline editing)

Backend execution is Python (VideoDB Editor), optimized for fast preview.

---

2) Goals

* Fast time-to-meme: from template → preview in seconds.
* Template reusability: one template supports infinite variations via parameters.
* “Code transparency”: users can see the Python behind the template (read-only in V1).
* Safety by design: prevent arbitrary-code abuse while still feeling “programmable”.
* Foundation for a future community marketplace (publishing templates later).

Non-goals (V1)

* User-authored arbitrary Python execution in the browser (high risk).
* Public template publishing, ratings, comments, moderation flows (design for it, don’t ship it).
* Complex editing UI (timeline, drag-drop). This is “run templates”, not “be an editor”.

---

3) Key concept: “Execute code” without arbitrary code

To match your requirement (“execute code see results”) while staying safe:

V1 approach

* Templates are prebuilt, curated Python modules owned by you (the site).
* Users can view the code, but cannot edit it.
* Users only provide parameters (asset IDs, text, simple options).
* Backend runs a single allowed entrypoint per template, e.g. render(params, videodb_key).

Future (V2+)

* “Fork template” into a safe DSL or sandboxed Python (with strong isolation and approvals).

This gives the “code-first” experience without opening a remote code execution platform on day 1.

---

4) Personas

1. Creator / Meme Maker
* Wants quick output, minimal setup, shareable link.
1. Growth Marketer
* Wants repeatable variations (A/B testing hooks, batch runs later).
1. Developer
* Wants to understand how templates work and reuse patterns in their own codebase.
1. Template Author (future)
* Will submit templates, version them, and publish to community.

---

5) Primary user journeys

Journey A: Generate a meme (core loop)

1. Open site → browse template library
2. Click template → see preview + “How it works”
3. Paste VideoDB API Key
4. Swap assets (IDs) + text fields
5. Click Run
6. Watch stream in embedded player
7. Copy Stream URL / Share link

Journey B: Use your own media quickly

* After key is entered, user can optionally browse their VideoDB collection in an asset picker (videos/images/audio) and auto-fill IDs.

Journey C: Learn by reading code

* Template detail page includes:
  * code (read-only)
  * parameter docs
  * example inputs
  * “What this template demonstrates” (fit/position/captions/audio layering, etc.)

---

6) Product scope (V1)

6.1 Template library

* Grid gallery with:
  * template name, thumbnail/short demo
  * “meme type” tags (caption meme, reaction overlay, intro card, side-by-side, etc.)
  * difficulty tag (basic / advanced)
* Search + filter (client-side ok for V1)

6.2 Template detail page

* Demo preview (pre-rendered example or a default stream URL)
* Parameter form (schema-driven)
* Read-only code viewer
* “Run” button
* Output area:
  * embedded player
  * stream URL
  * copy buttons

6.3 API key input & handling

* Paste key once per session
* Default storage: browser local storage (opt-in “remember”) or session only
* Backend never logs keys; keys never included in URLs

6.4 Execution + preview

* Backend calls VideoDB Editor Timeline.generate_stream()
* Return:
  * stream_url
  * optional player_url
  * structured logs/errors (sanitized)

6.5 Run history (lightweight, optional but useful)

* In-session: keep last N runs in browser memory
* If you add login later, this becomes user-run history

---

7) Functional requirements

7.1 Template definition format

Each template must declare:

* template_id, name, description, tags
* params_schema (types, required, defaults, validation rules)
* demo_inputs (safe example)
* entrypoint (Python function reference)

Param types (V1)

* video_asset_id, image_asset_id, audio_asset_id
* text
* number (duration, volume, etc.)
* enum (fit mode, caption animation, etc.)
* color (hex or ASS color if you expose it)

7.2 Template execution contract (Python)

* Allowed imports: VideoDB SDK + VideoDB Editor modules + safe stdlib subset
* One entrypoint:
  * render(conn, params) -> {stream_url, metadata}
* No filesystem writes required
* No arbitrary outbound network calls (only VideoDB API)

7.3 Asset swapping UX

* Simple mode: paste IDs
* Assisted mode (preferred):
  * “Fetch my assets” button after key is entered
  * shows user’s videos/images/audio list (paginated)
  * selecting fills IDs into fields

7.4 Errors & debugging

* Show user-friendly errors:
  * invalid key
  * asset not found / permission denied
  * clip duration > source length
  * caption pre-req not met (e.g., index_spoken_words missing)
* Provide a collapsible “Debug details” section with request id + sanitized stack trace

---

8) Non-functional requirements

Performance targets

* Template page load: < 2s on decent connection (cached assets)
* “Run” to stream URL: aim for “feels instant” (best-effort; depends on VideoDB)
* Player start time: low-latency HLS where possible

Reliability

* Retries for transient VideoDB API failures (bounded)
* Idempotency/caching: if params are identical, optionally reuse prior stream (future)

Security (critical)

This product touches user keys and runs backend code.

Minimum requirements:

* No arbitrary user code execution (V1)
* Template runner in a locked-down sandbox:
  * timeouts (e.g., 15–30s)
  * memory/CPU limits
  * restricted filesystem
  * restricted network egress (only VideoDB endpoints)
* Secret handling
  * never store plaintext API keys server-side
  * if you must store: encrypt at rest + short TTL + separate secrets store
* Logging hygiene
  * redact keys and sensitive headers from logs
* Abuse prevention
  * rate limits per IP + per key fingerprint
  * captcha threshold for suspicious traffic

---

9) System architecture (V1)

Components

* Frontend (Next.js/React)
  * template library + template detail + code viewer + player
* Backend API (Python, e.g., FastAPI)
  * GET /templates
  * GET /templates/{id}
  * POST /run/{template_id} (executes template with params + key)
  * optional GET /assets (lists user assets via their key)
* Template registry
  * V1: templates live in repo + metadata JSON
  * V2: DB-backed templates + versioning
* Execution sandbox
  * simplest: isolated container per request or a worker pool with strict guards
  * ensure concurrency limits to protect cost

Request flow

1. User enters API key in UI
2. UI sends POST /run/{template_id} with:
  * params
  * key (in Authorization header or encrypted payload)
3. Backend creates VideoDB connection using that key
4. Calls template entrypoint → builds Timeline → generate_stream()
5. Returns stream URL → UI renders player

---

10) Data model (designed for extensibility)

Template

* id
* name, description
* tags
* thumbnail_url / demo_stream_url
* params_schema
* version
* author (future)
* status (published/unlisted/flagged) (future)

Run (optional storage in V1; important in V2)

* run_id
* template_id, template_version
* params_hash
* created_at
* result_stream_url
* runtime_ms
* error_code / error_message (sanitized)

---

11) Future extensibility (publishing templates later)

Design hooks now:

* Template versioning (v1, v2, …) with changelog
* Template linting + automated safety checks
* Submission workflow:
  * “Submit template” → review queue → approve → publish
* Moderation:
  * DMCA/reporting
  * banned content tags / policy enforcement
* Forking:
  * safest path: templates as declarative composition spec (JSON graph) rather than freeform Python

---

12) MVP acceptance criteria (V1)

* User can browse a library of templates and open a template detail page.
* User can paste VideoDB API key and run at least 5 curated templates end-to-end.
* User can swap in their own asset IDs and see output update via a new stream URL.
* Code is visible (read-only), and params are documented and validated.
* Execution is sandboxed with timeouts and rate limits; no secrets appear in logs.
* Errors are understandable and actionable.

---

13) Risks & mitigations

* Remote code execution risk → don’t allow user-edited Python in V1; sandbox even curated templates.
* Key leakage → never put keys in URLs; redact logs; prefer client-side storage; short TTL if server-held.
* Cost blowups (popular site) → rate limits, concurrency caps, caching identical runs, optional “preview mode”.
* Template quality variance → curated library + templates tested with golden demo inputs.
