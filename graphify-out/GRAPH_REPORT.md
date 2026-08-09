# Graph Report - petgift-completo  (2026-07-27)

## Corpus Check
- 43 files · ~63,822 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 397 nodes · 652 edges · 28 communities (27 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Room & Pet Rendering
- Deployment Config
- Game Screens & Minigames
- Frontend Dependencies
- Legacy Standalone Game (historial)
- Pet Accessories & Art Check
- Creation Wizard Steps
- Icon Library
- Legacy Standalone Wizard
- Backend API Routes & Schemas
- Backend Data Models
- Pet Body Parts & Colors
- App Routing & Pages
- Game State Persistence
- Frontend API Client
- Misc UI Components
- Music Embed
- Pet Style Presets
- Legacy Mood Studio
- Memory & Quiz Games
- Room Screen Helpers
- Outfit Designer
- App Icon Assets

## God Nodes (most connected - your core abstractions)
1. `findFurniture()` - 10 edges
2. `tint()` - 10 edges
3. `PetGift — frontend README` - 9 edges
4. `PetRecipeMarkup()` - 8 edges
5. `Room()` - 8 edges
6. `Desplegar PetGift — guía paso a paso` - 8 edges
7. `RoomScreen()` - 7 edges
8. `PetGiftGame()` - 7 edges
9. `clamp()` - 7 edges
10. `defaultPlacement()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `fastapi (paquete)` --semantically_similar_to--> `FastAPI`  [INFERRED] [semantically similar]
  backend/requirements.txt → README.md
- `DEPLOY.md (referenciado)` --references--> `Desplegar PetGift — guía paso a paso`  [EXTRACTED]
  frontend/README.md → backend/DEPLOY.md
- `netlify.toml (referenciado)` --references--> `netlify.toml (referenciado)`  [INFERRED]
  backend/DEPLOY.md → frontend/README.md
- `RoomScreen()` --indirect_call--> `findFurniture()`  [INFERRED]
  frontend/src/components/PetGiftGame.jsx → frontend/src/roomCatalog.jsx
- `backend/DEPLOY.md (referenciado)` --references--> `Desplegar PetGift — guía paso a paso`  [EXTRACTED]
  README.md → backend/DEPLOY.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo de despliegue PetGift (Render + Netlify)** — backend_deploy_render, backend_deploy_netlify, backend_render_document, frontend_readme_document, backend_deploy_vite_api_base [EXTRACTED 0.90]
- **Stack tecnológico del backend PetGift** — backend_requirements_fastapi, backend_requirements_uvicorn, backend_requirements_sqlalchemy, backend_requirements_psycopg2_binary, backend_render_petgift_api [INFERRED 0.85]
- **Flujo de rutas del frontend PetGift** — frontend_readme_app_jsx_ref, frontend_readme_createpage_ref, frontend_readme_giftpage_ref, frontend_readme_wizard_ref, frontend_readme_game_ref [EXTRACTED 0.90]

## Communities (28 total, 1 thin omitted)

### Community 0 - "Room & Pet Rendering"
Cohesion: 0.09
Nodes (33): BgRemover(), PARTICLE, Pet(), ShopScreen(), clamp(), clampPlacement(), defaultPlacement(), labelFor() (+25 more)

### Community 1 - "Deployment Config"
Cohesion: 0.06
Nodes (38): ALLOWED_ORIGINS (env var), api.js (referenciado), Desplegar PetGift — guía paso a paso, petgift-frontend.zip (referenciado), Netlify, netlify.toml (referenciado), Postgres (producción), Render (+30 more)

### Community 2 - "Game Screens & Minigames"
Cohesion: 0.07
Nodes (13): BattleshipGame(), buildShipBoard(), DEMO_PET, DEMO_POSTERS, FALLBACK_EMOJIS, FOOD_EMOJIS, MOOD_LABEL, PET_CENTER (+5 more)

### Community 3 - "Frontend Dependencies"
Cohesion: 0.07
Nodes (28): autoprefixer, dependencies, react, react-dom, react-router-dom, devDependencies, autoprefixer, postcss (+20 more)

### Community 4 - "Legacy Standalone Game (historial)"
Cohesion: 0.08
Nodes (15): buildCardPool(), buildDeck(), buildPosterList(), DEMO_PET, DEMO_POSTERS, FALLBACK_EMOJIS, FOOD_EMOJIS, MemoryGame() (+7 more)

### Community 5 - "Pet Accessories & Art Check"
Cohesion: 0.14
Nodes (20): DARK_BASE, EXTRA_ACCESSORIES, findPart(), HEAD_ACCESSORIES, NECK_ACCESSORIES, PATTERNS, renderPattern(), S (+12 more)

### Community 6 - "Creation Wizard Steps"
Cohesion: 0.08
Nodes (6): ModularPetStep(), MOODS, PART_GROUPS, STEP_META, THUMB_VIEW, randomRecipe()

### Community 7 - "Icon Library"
Cohesion: 0.09
Nodes (18): IconBack(), IconBag(), IconBall(), IconBowl(), IconCamera(), IconClose(), IconCoin(), IconCookie() (+10 more)

### Community 8 - "Legacy Standalone Wizard"
Cohesion: 0.09
Nodes (4): checkerStyle, COLORS, MOODS, STEP_META

### Community 9 - "Backend API Routes & Schemas"
Cohesion: 0.18
Nodes (19): create_pet(), feed_pet(), generate_slug(), get_manifest(), get_pet(), Config, DecorItemIn, DecorItemOut (+11 more)

### Community 10 - "Backend Data Models"
Cohesion: 0.19
Nodes (13): DecorItem, FoodPreference, Outfit, Pet, Photo, PhotoUseEnum, Phrase, PhraseCategoryEnum (+5 more)

### Community 11 - "Pet Body Parts & Colors"
Cohesion: 0.14
Nodes (12): alt(), ACCENT_COLORS, BELLY_COLORS, BODY_COLORS, darken(), EARS, EYE_COLORS, isPale() (+4 more)

### Community 12 - "App Routing & Pages"
Cohesion: 0.25
Nodes (6): App(), GlobalDefs(), PetGiftWizard(), ArtCheck(), CreatePage(), GiftPage()

### Community 13 - "Game State Persistence"
Cohesion: 0.25
Nodes (10): buildCardPool(), buildPosterList(), getSlugFromUrl(), PetGiftGame(), DEFAULT_GAME_STATE, KEY(), loadGameState(), migrate() (+2 more)

### Community 14 - "Frontend API Client"
Cohesion: 0.43
Nodes (7): createPet(), feedPetRemote(), getLocalPet(), loadPet(), PET_KEY(), randomSlug(), saveLocalPet()

### Community 15 - "Misc UI Components"
Cohesion: 0.25
Nodes (8): ActionButton(), GameCard(), MemoryCard(), StatMeter(), Chip(), PhotosStep(), StylePicker(), tint()

### Community 16 - "Music Embed"
Cohesion: 0.47
Nodes (5): MusicPlayer(), MusicStep(), providerLabel(), SPOTIFY_KINDS, toEmbedUrl()

### Community 17 - "Pet Style Presets"
Cohesion: 0.53
Nodes (5): PartPicker(), applyStyle(), findStyle(), orderForStyle(), PET_STYLES

### Community 18 - "Legacy Mood Studio"
Cohesion: 0.33
Nodes (3): checkerStyle, COLORS, MOODS

### Community 19 - "Memory & Quiz Games"
Cohesion: 0.40
Nodes (5): buildDeck(), buildQuizRounds(), MemoryGame(), QuizGame(), shuffleArray()

### Community 20 - "Room Screen Helpers"
Cohesion: 0.67
Nodes (3): renderPosterContent(), RoomScreen(), newPlacementKey()

### Community 21 - "Outfit Designer"
Cohesion: 0.67
Nodes (3): OutfitDesigner(), recipeToPngDataUrl(), renderToStaticSvgString()

## Knowledge Gaps
- **63 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+58 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `C` connect `Room & Pet Rendering` to `Game Screens & Minigames`, `Creation Wizard Steps`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `tint()` connect `Misc UI Components` to `Room & Pet Rendering`, `Game Screens & Minigames`, `Creation Wizard Steps`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `SHADOW` connect `Room & Pet Rendering` to `Game Screens & Minigames`, `Creation Wizard Steps`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _63 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Room & Pet Rendering` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Deployment Config` be split into smaller, more focused modules?**
  _Cohesion score 0.0641025641025641 - nodes in this community are weakly interconnected._
- **Should `Game Screens & Minigames` be split into smaller, more focused modules?**
  _Cohesion score 0.0735632183908046 - nodes in this community are weakly interconnected._