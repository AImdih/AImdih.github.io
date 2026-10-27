/*
 * ---------------------------------------------------------------------------
 * PORTFOLIO CONTENT
 * ---------------------------------------------------------------------------
 * Everything editable lives in this file.
 *
 *  - site:             your name, role, email, about copy, socials and skills
 *  - projects:         the nine professional games, in order
 *  - personalProjects: personal work shown in the "Personal" tab
 *
 * Project fields:
 *   title       shown on the card and in the case study
 *   series      small label (also used by the filter buttons)
 *   filter      "ac" | "rayman" | "other"
 *   genre       short genre label
 *   image       path to the cover in /icons
 *   summary     one or two sentences about the game
 *   role        your role on the project (edit this!)
 *   year        year or range (edit this!)
 *   studio      studio / team (edit this!)
 *   platforms   platforms (edit this!)
 *   highlights  three short game highlights
 *   link        project URL — leave "" to hide the link button
 * ---------------------------------------------------------------------------
 */

window.PORTFOLIO = {
  site: {
    name: "Your Name",
    role: "Game Developer",
    email: "hello@example.com",
    tagline: "Worlds worth getting lost in.",
    intro:
      "I'm a game developer who helps ship gameplay and worlds for professional titles — and builds small games, tools and experiments on the side. This portfolio collects both.",
    about:
      "I'm a game developer who cares about how a game feels in the player's hands — the weight of a jump, the pull of a good loop, the moment a world suddenly clicks. Over the years I've helped ship professional titles across console, PC and mobile, from cursed seas and shadowed cities to painted forests.",
    socials: [
      { label: "LinkedIn", url: "#" },
      { label: "GitHub", url: "#" },
      { label: "ArtStation", url: "#" }
    ],
    skills: [
      "Gameplay",
      "Level Design",
      "Systems",
      "Prototyping",
      "UI / UX",
      "Tools"
    ]
  },

  projects: [
    {
      id: 1,
      title: "Heroes of Might and Magic",
      series: "Might & Magic",
      filter: "other",
      genre: "Turn-based Strategy",
      image: "icons/1_heroes_of_might_and_magic.jpg",
      summary:
        "A landmark turn-based strategy series where heroes, armies and arcane magic collide across sprawling fantasy maps.",
      role: "Programmer",
      year: "2026 – Present",
      studio: "Ubisoft",
      platforms: "PC",
      engine: "Snowdrop",
      responsibilities: [
        "Support the team shipping the game by implementing remaining features and fixing bugs."
      ],
      highlights: ["Faction strategy", "Hero progression", "Map exploration"],
      link: ""
    },
    {
      id: 2,
      title: "Assassin's Creed Black Flag Resynced",
      series: "Assassin's Creed",
      filter: "ac",
      genre: "Action-Adventure",
      image: "icons/2_assassin's_creed_black_flag_resynced.jpg",
      summary:
        "A rebuilt pirate odyssey that blends open-world sailing, naval combat and a cast of rogues into one swashbuckling adventure.",
      role: "Programmer",
      year: "2026 – Present",
      studio: "Ubisoft",
      platforms: "PC",
      engine: "Anvil",
      responsibilities: [
        "Lead the tech of Kenway's Fleet Activity features (gameplay and UI).",
        "Design the data structure of the features.",
        "Implement gameplay and UI of the features using C++.",
        "Onboard new programmers joining the team.",
        "Debug and optimize the features.",
        "Support the Hideout team implementing new features.",
        "Collaborate and communicate with other teams from different studios."
      ],
      highlights: ["Naval warfare", "Open-world sailing", "Pirate fantasy"],
      link: ""
    },
    {
      id: 3,
      title: "Assassin's Creed Shadows",
      series: "Assassin's Creed",
      filter: "ac",
      genre: "Action-Adventure",
      image: "icons/3_assassin's_creed_shadows.avif",
      summary:
        "A stealth-driven open world set in feudal Japan, built around shadows, shifting seasons and two distinct protagonists.",
      role: "",
      year: "20XX",
      studio: "Add studio",
      platforms: "Add platforms",
      highlights: ["Seasonal stealth", "Dual protagonists", "Feudal Japan"],
      link: ""
    },
    {
      id: 4,
      title: "Skull and Bones",
      series: "Skull and Bones",
      filter: "other",
      genre: "Naval Action RPG",
      image: "icons/4_skull_and_bones.avif",
      summary:
        "A naval action RPG about rising from nobody to pirate king across a dangerous, beautiful Indian Ocean.",
      role: "",
      year: "20XX",
      studio: "Add studio",
      platforms: "Add platforms",
      highlights: ["Naval combat", "Ship building", "Pirate progression"],
      link: ""
    },
    {
      id: 5,
      title: "Rayman Legends",
      series: "Rayman",
      filter: "rayman",
      genre: "Platformer",
      image: "icons/5_rayman_legends.jpg",
      summary:
        "A hand-painted platformer celebrated for its music levels, four-player chaos and wonderfully fluid movement.",
      role: "",
      year: "20XX",
      studio: "Add studio",
      platforms: "Add platforms",
      highlights: ["Music levels", "Co-op platforming", "Hand-painted art"],
      link: ""
    },
    {
      id: 6,
      title: "Rayman Origins",
      series: "Rayman",
      filter: "rayman",
      genre: "Platformer",
      image: "icons/6_rayman_origins.jpg",
      summary:
        "The series' return to 2D — a burst of expressive animation, tight platforming and co-op mayhem.",
      role: "",
      year: "20XX",
      studio: "Add studio",
      platforms: "Add platforms",
      highlights: ["Fluid platforming", "Four-player co-op", "Expressive animation"],
      link: ""
    },
    {
      id: 7,
      title: "Rayman Fiesta Run",
      series: "Rayman",
      filter: "rayman",
      genre: "Mobile Runner",
      image: "icons/7_rayman_fiesta_run.jpg",
      summary:
        "A mobile runner that distils Rayman's movement into quick, rhythmic, one-touch levels.",
      role: "",
      year: "20XX",
      studio: "Add studio",
      platforms: "Add platforms",
      highlights: ["One-touch running", "Rhythm levels", "Pick-up-and-play"],
      link: ""
    },
    {
      id: 8,
      title: "Rayman Jungle Run",
      series: "Rayman",
      filter: "rayman",
      genre: "Mobile Runner",
      image: "icons/8_rayman_jungle_run.jpg",
      summary:
        "A mobile auto-runner built around precise jumps, wall-runs and lush hand-drawn worlds.",
      role: "",
      year: "20XX",
      studio: "Add studio",
      platforms: "Add platforms",
      highlights: ["Auto-running", "Precision jumps", "Hand-drawn worlds"],
      link: ""
    },
    {
      id: 9,
      title: "Rabbids 3D",
      series: "Rabbids",
      filter: "other",
      genre: "Platformer",
      image: "icons/9_rabbids_3d.jpg",
      summary:
        "A portable platforming romp starring the Rabbids, packed with slapstick, pirates and time-travel chaos.",
      role: "",
      year: "20XX",
      studio: "Add studio",
      platforms: "Add platforms",
      highlights: ["Slapstick platforming", "Portable levels", "Rabbids chaos"],
      link: ""
    }
  ],

  /*
   * Personal projects — shown in the "Personal" work tab.
   *
   * These are editable placeholders. Replace the titles, copy, tech, features
   * and links with your own projects. Add a real screenshot path to `image` to
   * override the generated abstract cover.
   */
  personalProjects: [
    {
      id: "p1",
      title: "Personal Project 01",
      type: "Game",
      summary:
        "Replace this with a short description of the project and why you built it.",
      year: "2026",
      role: "Designer & Developer",
      tech: ["Unity", "C#"],
      features: [
        "Describe a feature or system you built.",
        "Describe a technical challenge you solved.",
        "Describe the result, a metric or what you learned."
      ],
      links: [
        { label: "Live demo", url: "" },
        { label: "Source code", url: "" }
      ],
      image: "",
      coverTheme: "ember"
    },
    {
      id: "p2",
      title: "Personal Project 02",
      type: "Tool",
      summary:
        "Replace this with a short description of the tool and the problem it solves.",
      year: "2026",
      role: "Developer",
      tech: ["C++", "Qt"],
      features: [
        "Describe a feature or workflow you built.",
        "Describe a technical challenge you solved.",
        "Describe the result, a metric or what you learned."
      ],
      links: [
        { label: "Live demo", url: "" },
        { label: "Source code", url: "" }
      ],
      image: "",
      coverTheme: "ocean"
    },
    {
      id: "p3",
      title: "Personal Project 03",
      type: "Experiment",
      summary:
        "Replace this with a short description of the experiment and what you explored.",
      year: "2026",
      role: "Developer",
      tech: ["TypeScript", "WebGL"],
      features: [
        "Describe an experiment or prototype you built.",
        "Describe a technical challenge you solved.",
        "Describe the result, a metric or what you learned."
      ],
      links: [
        { label: "Live demo", url: "" },
        { label: "Source code", url: "" }
      ],
      image: "",
      coverTheme: "violet"
    }
  ]
};
