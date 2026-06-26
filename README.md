# مولّد أنشطة التعلم المتمايز — Differentiated Learning Activity Generator

> An AI-powered web application that analyzes uploaded curriculum PDFs and instantly generates three differentiated learning activities tailored to different student levels.
>
> 🌐 **The application is fully in Arabic and is designed for Arabic-speaking educators.**

---

##  Features

- 📄 Upload a curriculum PDF and let the AI extract relevant content
- 🎯 Generate three activities per lesson: **Supportive**, **Core**, and **Enrichment**
- ⏱️ Set activity duration and student level
- ⚡ Powered by **Google Gemini** (free tier)
- 🔒 No data is stored — files and activities are cleared on page refresh
- 🎨 Clean, responsive Arabic UI with RTL support

---

##  Getting Started

### Prerequisites

- A free [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A [Vercel](https://vercel.com/) account

### Deploy on Vercel

1. Fork or clone this repository to your GitHub account
2. Go to [vercel.com](https://vercel.com/) and create a new project
3. Import the repository
4. Before deploying, add the following environment variable in the Vercel project settings:

| Variable | Description |
|----------|-------------|
| `VITE_GEMINI_KEY` | Your Google Gemini API key |

5. Click **Deploy** ✅

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| AI Model | Google Gemini 2.0 Flash (via REST API) |
| Styling | Inline CSS with RTL support |
| Language | Arabic 🇸🇦 |

---

##  How It Works

1. Upload your curriculum as a **PDF file**
2. Enter the **unit name** and **lesson name**
3. Select **activity duration** and **student level**
4. Click **Generate** — the AI reads the PDF and returns three structured activities in JSON format
5. Activities are displayed instantly as cards on the screen

---

##  Customization

### Using a Different Gemini Model

By default the app uses `gemini-2.0-flash`. To switch to another model:

1. In `src/App.jsx`, find **line 97** and replace the model name in the URL:

```js
// Before
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

// After (example: using gemini-1.5-pro)
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`
```

2. Make sure your `VITE_GEMINI_KEY` has access to the chosen model.

---

##  Notes

- Large PDF files may take longer to process or exceed the free tier limits of the Gemini API
- All data is session-only — nothing is saved to any database or server

---

##  Project Structure

```
├── web/
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── index.html
├── package.json       # Project dependencies and scripts
└── vite.config.js     # Vite configuration
```

---

##  License

This project is open source and available under the [MIT License](LICENSE).
