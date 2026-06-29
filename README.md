# 🎛️ RampX Music - Liquid Chrome Music Player

RampX is a high-fidelity, zero-cost music streaming application featuring a premium Apple-inspired glassmorphic design and liquid mercury backdrops. It runs as a hybrid full-stack system locally and falls back automatically to a serverless, database-free client when deployed on static servers.

🔗 **Live Link (GitHub Pages):** [https://aburahmannn.github.io/RampX/](https://aburahmannn.github.io/RampX/)

---

## ✨ Features
* **Liquid Chrome Aesthetics:** Frosted glass panels, organic mercury backdrops, and a pulsing, morphing Liquid AI Orb widget matching premium dark/OLED styles.
* **On-Demand Streaming:** Resolves YouTube audio streams dynamically based on search terms.
* **iTunes Search Engine:** Fetches song previews, artist metadata, high-resolution cover arts, and genre info.
* **Smart Library & Sorting:** Filter your collection by Liked Songs, Listening History, and Playlists. Sort lists by Recently Played, Alphabetical (A-Z), or Artist.
* **Seamless Android Integration:** Includes PWA compatibility and a dedicated Download Center to fetch standalone APK installers.
* **Dual-State Failover Architecture:** Auto-saves favorites and playlists to browser `localStorage` and queries public indexers (Invidious) when the Spring Boot backend is unavailable.

---

## 🛠️ Skills & Technologies Used

### 1. Frontend Engineering
* **React.js & Vite:** Core layout framework, state management, and optimized bundling.
* **Vanilla CSS (Glassmorphism & Keyframes):** Liquid metal movements, backdrop blurs, slide-out queue drawers, and adaptive scaling layouts.
* **Workbox & Progressive Web Apps (PWA):** Service workers caching assets for offline capabilities.
* **Lucide Icons:** Premium modern interface iconography.

### 2. Backend Engineering
* **Java 21 & Spring Boot:** Core microservices host.
* **Spring Data JPA & Hibernate:** Object-Relational Mapping (ORM) and schema bindings.
* **H2 Database Engine:** File-based lightweight relational SQL database.
* **YouTube Regex Scraper:** On-demand HTML parsing and stream crawler utilizing Java HttpClient and pattern matchers.

### 3. Git, Build Pipelines & Deployment
* **Git Version Control:** Branch management (`main`, `gh-pages`) and stagers.
* **Maven Wrapper:** Native Java bundler packaging compiled static client folders into Spring Boot fat JARs.
* **GitHub Pages Hosting:** Client-side static serverless publishing.

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Client-Side (React & PWA)
        UI[Aesthetics & UI Components]
        Search[iTunes Music API Search]
        LocalDB[Browser localStorage Failover]
        Player[YouTube Iframe Audio Player]
    end
    
    subgraph Server-Side (Spring Boot fat JAR)
        Controller[API & Proxy Controllers]
        Scraper[YouTube Regex Crawlers]
        SQL[H2 Persistent Database]
    end
    
    UI --> Controller
    UI --> LocalDB
    Search --> UI
    Player --> Scraper
    Player -->|Fallback| Invidious[Public Invidious Indexers]
    Controller --> SQL
```

---

## 🚀 Local Installation & Execution

### Prerequisites
* Java JDK 21 or higher
* Node.js (v18+)

### Step-by-Step Run
1. Clone the repository:
   ```bash
   git clone https://github.com/AbuRahmannn/RampX.git
   cd RampX
   ```
2. Build the application (compiles React assets, copies static bundles, and builds the Spring Boot JAR):
   ```bash
   .\build.bat
   ```
3. Launch the server:
   ```bash
   .\run.bat
   ```
4. Open your browser and listen:
   👉 **[http://localhost:8080](http://localhost:8080)**
