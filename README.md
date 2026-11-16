# 🍌🍸 Banana Split — Cocktail Recipe & Mixology Platform
> **Academic Project — Fall 2026**  
> **Courses:** Object-Oriented UML & Advanced Web Programming  
---

## 👥 Project Team Members

| Student Name | Main Responsibilities |
| :--- | :--- |
| **Tom GARRIDO** | Database modeling, Vue.js Frontend views |
| **Antonin LE CLANCHE** | SQL/JSON datasets, UML diagrams |

---

## 📖 Project Overview & Topic

**Banana Split** is an interactive web application designed for cocktail enthusiasts or home bartenders. 

Have you ever wanted to make a cocktail at home using the ingredients you already have in your kitchen, without knowing which recipe to follow? **Banana Split** solves this problem by allowing users to:
1. **Search & Filter** cocktail recipes by title, creator, or directly by available ingredients.
2. **Explore Detailed Preparation Guides** including exact ingredient measurements, glassware recommendations, and step-by-step instructions.
3. **Share & Rate Creations** through a community-driven platform where members can publish their own cocktail recipes, leave star ratings, write reviews, and upvote/downvote helpful comments.
---

## 🗄️ Database Architecture (ER & MLD)

The database is normalized and structured around **8 core entities**. The full Entity-Relationship and Logical Data Model diagrams are available in [`MLD + ER diagram LECLANCHE Antonin & GARRIDO Tom.pdf`](./MLD%20+%20ER%20diagram%20LECLANCHE%20Antonin%20&%20GARRIDO%20Tom.pdf).

| Table Name | Primary Key (`PK`) | Foreign Keys (`FK`) | Description & Key Attributes |
| :--- | :--- | :--- | :--- |
| **`USER`** | `user_id` | — | Registered members (`username`, `email`, `password`, `bio`, `date_of_birth`, `profile_picture_url`, `created_at`). |
| **`INGREDIENT`** | `ingredient_id` | — | Bar & kitchen items (`ingredient_name`, `alcohol_degree`, `allergens`, `average_price`, `category_name`, `is_legal`). |
| **`RECIPE`** | `recipe_id` | `user_id` | Recipe details (`title`, `category`, `description`, `photo_url`, `created_at`, `glass_name`, `capacity_cl`). |
| **`ALBUM`** | `album_id` | `user_id` | A named, colored album/fridge owned by a user. |
| **`ALBUM_RECIPE`** | `album_id`, `recipe_id` | `album_id`, `recipe_id` | Associates a user's recipes with one or more of their albums. |
| **`RECIPE_INGREDIENT`** | `recipe_id`, `ingredient_id` | `recipe_id`, `ingredient_id` | Associative table linking recipes and ingredients with exact `quantity` and `unit_of_measure`. |
| **`PREPARATION_STEP`** | `step_id` | `recipe_id` | Ordered instructions for a cocktail (`step_number`, `instruction`). |
| **`REVIEW`** | `review_id` | `user_id`, `recipe_id` | User feedback on cocktails (`rating`, `comment`, `created_at`, `Upvote`, `Downvote`). |

---

## 📂 Repository Structure

```text
Project-Web-Programming/
├── frontend/
│   ├── index.html
│   ├── main.js
│   ├── router.js
│   ├── vite.config.js
│   ├── package.json
│   ├── assets/
│   ├── data/
│   │   └── bananasplit.json
│   └── src/
│       ├── index.vue
│       ├── main.vue
│       ├── recipe.vue
│       ├── ingredient.vue
│       ├── share.vue
│       ├── users.vue
│       └── album.vue
├── backend/                 # Express API
├── database/
│   └── bananasplit.sql
├── .gitignore
└── README.md
```

## Run the application locally

### Prerequisites

- Node.js and npm
- MySQL Server
- A MySQL database initialized with `database/bananasplit.sql`

> **Warning:** `database/bananasplit.sql` drops and recreates its tables. Import it only into a new or disposable database; back up any data you need to keep.

### Configure and start the backend

1. Start MySQL and import `database/bananasplit.sql` using MySQL Workbench or the MySQL command line.
2. Copy `backend/.env.example` to `backend/.env`, then set your MySQL password in `DB_PASSWORD`. Set `DB_USER` to your MySQL username if it is not `root`. Do not commit `backend/.env`; it is ignored by Git.
3. For sessions that survive backend restarts, generate a random secret in PowerShell with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and put the result in `SESSION_SECRET` in `backend/.env`. A temporary random secret is generated automatically for local development if this is left blank. Production requires an explicit secret.
4. In a PowerShell terminal, install the backend dependencies (first run only) and start the API:

```powershell
cd "C:\path\to\Project-Web-Programming\backend"
npm install
npm start
```

The API listens on `http://localhost:9000`. Check `http://localhost:9000/api/v1/health`; a successful response is `{"status":"ok","database":"connected"}`. An HTTP 503 means the API started but could not connect to MySQL; check that MySQL is running and that `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env` are correct.

### Recipe read API

The Recipes page reads its data from these MySQL-backed endpoints:

| Method | Endpoint | Response |
| :--- | :--- | :--- |
| `GET` | `/recipesapi/recipes` | Recipes with creator, rating summary, ingredients, and preparation steps. |
| `GET` | `/recipesapi/list` | Backwards-compatible alias for the recipe list. |
| `GET` | `/recipesapi/recipes/:recipeId` | One recipe with its reviews and full details. |
| `GET` | `/recipesapi/ingredients` | Ingredients available for filtering recipes. |
| `POST` | `/recipesapi/recipes` | Publishes a recipe with ingredients and preparation steps for the signed-in user. |
| `GET` | `/recipesapi/recipes/mine` | Lists only the signed-in user's recipes. |
| `PUT` | `/recipesapi/recipes/:recipeId` | Updates a recipe and its ingredients/steps, only for its owner. |
| `DELETE` | `/recipesapi/recipes/:recipeId` | Deletes a recipe, only for its owner. |

The frontend uses `http://localhost:9000` by default. To use a different backend URL, define `VITE_API_BASE_URL` in the frontend environment.

The Share page requires a signed-in session. Recipe creation writes the recipe and all its ingredient/step rows in one database transaction. The recipe owner is taken from the session cookie; any user ID submitted by the browser is ignored.

The Albums page saves each user's fridges to MySQL and lets them add their own recipes to multiple fridges, or remove a recipe from a fridge without deleting it. Album ownership and recipe ownership are checked by the API.

| Method | Endpoint | Response |
| :--- | :--- | :--- |
| `GET` | `/albumsapi` | Lists the signed-in user's albums and their recipes. |
| `POST` | `/albumsapi` | Creates a fridge with a name and color. |
| `DELETE` | `/albumsapi/:albumId` | Deletes a fridge owned by the signed-in user. |
| `POST` | `/albumsapi/:albumId/recipes` | Adds one of the user's recipes to that fridge. |
| `DELETE` | `/albumsapi/:albumId/recipes/:recipeId` | Removes the recipe from that fridge without deleting the recipe. |

Deleting a recipe itself still removes its review and album links through the database foreign-key cascades.

### Authentication API

The sign-up and sign-in forms use database-backed accounts and an HTTP-only session cookie:

| Method | Endpoint | Response |
| :--- | :--- | :--- |
| `POST` | `/authapi/register` | Creates an account, hashes its password, and signs the user in. |
| `POST` | `/authapi/login` | Checks credentials and starts a session. |
| `GET` | `/authapi/me` | Returns the current public user or `{"user":null}`. |
| `POST` | `/authapi/logout` | Ends the current session. |

New passwords are stored as bcrypt hashes. The SQL demo accounts have legacy plaintext passwords; on their first successful login, the password is replaced with a bcrypt hash. Use those demo accounts only locally, never for real credentials. Sessions currently use Express's in-memory store, which is suitable for local development but not production; production should use a persistent session store and an HTTPS origin.

### Start the frontend

Keep the backend terminal running. Open a second PowerShell terminal and run:

```powershell
cd "C:\path\to\Project-Web-Programming\frontend"
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The frontend and backend must both be running for API-backed pages to work. To create a production frontend build, run `npm run build` from `frontend/`.

---
## 📅 Project Roadmap & Deliverables Summary

* [x] **SEP/10:** Team formation, topic definition, CRUD plan, ER & Table Structure diagrams.
* [x] **SEP/17:** Full SQL script (`DROP` / `CREATE` / `INSERT`), mock JSON dataset ([`src/data/bananasplit.json`](./src/data/bananasplit.json)), `.gitignore`, and initial `README.md`.
* [x] **OCT/15:** Project-level UML Use Case diagram, Planned Gantt chart, Vue.js Frontend with 3+ list/table/reader views powered by JSON, and multi-branch Git workflow.
* [ ] **OCT/29:** Member-level UML diagrams (Wireframe, Activity, Sequence) & Full Frontend CRUD with JSON.
* [ ] **NOV/26:** Component & Class diagrams + Express.js MVC Backend repository.
* [ ] **DEC/04:** Frontend-Backend integration via Fetch API, Authentication/Authorization, and updated diagrams.
* [ ] **DEC/17:** Final Project Defense & Complete Documentation PDF.

---

*Developed by **Tom GARRIDO** & **Antonin LE CLANCHE** — Fall 2026.*
