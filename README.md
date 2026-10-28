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

The database is normalized and structured around **6 core entities**. The full Entity-Relationship and Logical Data Model diagrams are available in [`MLD + ER diagram LECLANCHE Antonin & GARRIDO Tom.pdf`](./MLD%20+%20ER%20diagram%20LECLANCHE%20Antonin%20&%20GARRIDO%20Tom.pdf).

| Table Name | Primary Key (`PK`) | Foreign Keys (`FK`) | Description & Key Attributes |
| :--- | :--- | :--- | :--- |
| **`USER`** | `user_id` | — | Registered members (`username`, `email`, `password`, `bio`, `date_of_birth`, `profile_picture_url`, `created_at`). |
| **`INGREDIENT`** | `ingredient_id` | — | Bar & kitchen items (`ingredient_name`, `alcohol_degree`, `allergens`, `average_price`, `category_name`, `is_legal`). |
| **`RECIPE`** | `recipe_id` | `user_id` | Cocktail datasheets (`title`, `description`, `photo_url`, `created_at`, `glass_name`, `capacity_cl`). |
| **`RECIPE_INGREDIENT`** | `recipe_id`, `ingredient_id` | `recipe_id`, `ingredient_id` | Associative table linking recipes and ingredients with exact `quantity` and `unit_of_measure`. |
| **`PREPARATION_STEP`** | `step_id` | `recipe_id` | Ordered instructions for a cocktail (`step_number`, `instruction`). |
| **`REVIEW`** | `review_id` | `user_id`, `recipe_id` | User feedback on cocktails (`rating`, `comment`, `created_at`, `Upvote`, `Downvote`). |

---

## 📂 Repository Structure

```text
Project-Web-Programming/
├── SRC/
│   ├── FRONTEND/
│   │   ├── index.html
│   │   ├── main.js
│   │   ├── index.vue
│   │   ├── package.json
│   │   └── vite.config.js
│   └── Images/
├── Diagrams/
│   ├── MLD + ER diagram LECLANCHE Antonin & GARRIDO Tom.pdf
│   ├── use-case-diagram_antom.vpp
│   ├── Gantt_Projet_Banana_Split.xlsx
├── bananasplit.sql
├── bananasplit.json
├── package-lock.json
├── .gitignore
└── README.md
```

---
## 📅 Project Roadmap & Deliverables Summary

* [x] **SEP/10:** Team formation, topic definition, CRUD plan, ER & Table Structure diagrams.
* [x] **SEP/17:** Full SQL script (`DROP` / `CREATE` / `INSERT`), mock JSON dataset (`bananasplit.json`), `.gitignore`, and initial `README.md`.
* [x] **OCT/15:** Project-level UML Use Case diagram, Planned Gantt chart, Vue.js Frontend with 3+ list/table/reader views powered by JSON, and multi-branch Git workflow.
* [ ] **OCT/29:** Member-level UML diagrams (Wireframe, Activity, Sequence) & Full Frontend CRUD with JSON.
* [ ] **NOV/26:** Component & Class diagrams + Express.js MVC Backend repository.
* [ ] **DEC/04:** Frontend-Backend integration via Fetch API, Authentication/Authorization, and updated diagrams.
* [ ] **DEC/17:** Final Project Defense & Complete Documentation PDF.

---

*Developed by **Tom GARRIDO** & **Antonin LE CLANCHE** — Fall 2026.*
