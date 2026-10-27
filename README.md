# Portfolio — home page

A single-page, animation-driven portfolio with Professional and Personal project
tabs, built with plain HTML, CSS and JavaScript. No build step, no dependencies.

## View it

Double-click `index.html`, or serve the folder for the best experience:

```powershell
npx serve .
```

The site also works from `file://`, but a tiny local server is recommended for the
browser history integration (opening a project adds a URL hash).

## Edit your details

Open `assets/projects.js`. At the top you'll find:

```js
site: {
  name: "Your Name",
  role: "Game Developer",
  email: "hello@example.com",
  tagline: "Worlds worth getting lost in.",
  intro: "...",
  about: "...",
  socials: [...],
  skills: [...]
}
```

Replace those values with your own. The name, role, email, hero tagline, hero
introduction, about copy, socials and skills update everywhere automatically.

Also update the `<title>` tag and the meta description in `index.html` — those are
the only personal details that live outside the content file.

### Placeholders to replace

The case studies for **Heroes of Might and Magic** and **Assassin's Creed Black Flag
Resynced** are filled from the notes in `details/`. The remaining seven projects
still contain editable placeholders:

- `year: "20XX"`
- `studio: "Add studio"`
- `platforms: "Add platforms"`
- `role: ""` — falls back to your `site.role`
- `link: ""` — leave empty to hide the “View project” button

Add an optional `engine` to show the engine in the facts panel, and an optional
`responsibilities` array to replace the generic game highlights with your actual
contribution notes. The game descriptions are public-facing summaries; edit them
whenever you're ready.

The **Personal** tab also contains three editable placeholder projects. Replace
their names, copy, tech, features and links in the `personalProjects` array.

## Project order

The nine professional projects render in the order of the `projects` array,
which follows the `1`–`9` prefixes in `icons/`. The interface displays the
project numbers in reverse — **09 down to 01** — while the array order and icon
order stay unchanged.

The map is intentionally mirrored from the grid: it starts with the final
project (displayed **01**) and ends with the first project (displayed **09**),
so the route reads **01 → 09** while the grid reads **09 → 01**.

Each project has:

| Field | Purpose |
| --- | --- |
| `id` | Used for the `#project-1` URL hash (the hash keeps the original icon order) |
| `title` | Card and case-study title |
| `series` | Small label and case-study tag |
| `filter` | `ac`, `rayman` or `other` (matches the filter buttons) |
| `genre` | Short genre label |
| `image` | Path to the cover in `icons/` |
| `summary` | One or two sentences |
| `role`, `year`, `studio`, `platforms`, `engine` | Case-study facts |
| `responsibilities` | Optional contribution bullets; replaces the game highlights when present |
| `highlights` | Three short game highlights |
| `link` | Optional project URL |

## Personal projects

The **Personal** tab reads from the `personalProjects` array in the same file.
Each entry supports:

| Field | Purpose |
| --- | --- |
| `id` | Used for the `#personal-p1` URL hash |
| `title` | Card and case-study title |
| `type` | Game, Tool, Experiment, etc. |
| `summary` | What it is and why you built it |
| `year`, `role` | Case-study facts |
| `tech` | Stack tags shown in the popup |
| `features` | “What I built” bullets |
| `links` | Array of `{ label, url }`; empty URLs hide the buttons |
| `image` | Optional screenshot path; overrides the generated cover |
| `coverTheme` | `ember`, `ocean` or `violet` for the generated cover |

If `image` is empty, the site generates an abstract SVG cover, so the tab looks
finished while you add screenshots. Put real images anywhere in the project and
point `image` at them, for example `assets/personal/my-game.jpg`.

### Deep links

- `#work` — Professional tab
- `#personal` — Personal tab
- `#project-3` — opens a professional project
- `#personal-p1` — opens a personal project

## Project map

The Work section opens in a **level-select map** by default:

- Professional projects appear as a **campaign map**.
- Personal projects appear as **side quests**.
- The map route is mirrored from the grid: it starts with the last project and ends with the first.
- Hover or focus a node to update the mission briefing; click or press Enter to open the case study.
- Filters dim and disable non-matching nodes.
- Previous/Next follows the order of the view you opened from: map route order from the map, grid order from the grid.
- Use the **Map / Grid** switch to return to the original card grid at any time.

Each project’s map position is defined in `mapLayouts` inside `assets/main.js`.
If you add or reorder projects, update the matching coordinates so the route and
nodes stay balanced.

## Structure

```
index.html
assets/
  styles.css    design, layout, responsive rules, animations
  projects.js   all editable content
  main.js       interactions, filters, tabs, dialog, loader
  personal/     optional folder for personal project screenshots
icons/          the nine covers (untouched)
details/        source notes for completed case studies
favicon.svg
```

## Interactions included

- Intro loader with progress counter (skipped for returning visitors and reduced motion)
- Pointer-reactive 3D cover fan in the hero
- Infinite game-title marquee that pauses on hover
- Scroll-reveal sections and animated counters
- Professional/Personal tabs with animated heading
- Level-select campaign map with cover medallions, glowing route and mission briefing
- Map / Grid switch, with the original card grid as an accessible alternate view
- Filterable professional work: filters dim map nodes and hide non-matching grid cards
- 3D card tilt and cursor-tracking shine in Grid view
- Generated abstract covers for personal projects without screenshots
- Full-screen case-study dialog that expands from the clicked card or map node
- Scoped previous/next navigation for each tab, arrow-key support, Esc/backdrop close
- Browser back closes the dialog; `#project-3` and `#personal-p1` open directly
- Mobile menu with a Personal shortcut, scroll progress bar, active navigation link
- Mobile map becomes a vertical quest trail with full project titles
- Full `prefers-reduced-motion` support and keyboard focus states

## Deploy

Upload the whole folder to GitHub Pages, Netlify, Vercel or any static host.
There is nothing to compile.
