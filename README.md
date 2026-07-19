# 📧 Gmail Compose Launcher

A modern, privacy-first web application built with **Flask + HTML5 + CSS3 + Vanilla JavaScript**
that opens Gmail's compose window with a **pre-filled recipient, subject, and message** — with
one click. The user reviews the email inside Gmail and clicks **Send** manually.

> 🔒 **This app never asks for your Gmail password, never logs you in, and never sends email
> automatically.** It simply builds a Gmail deep-link (`https://mail.google.com/mail/?view=cm...`)
> and opens it in a new browser tab.

---

## ✨ Features

- Premium **dark-theme glassmorphism** UI with animated gradient background
- One-click **"Compose Email"** button that opens Gmail pre-filled
- 1-second loading animation before Gmail opens
- **Toast notifications** ("Gmail opened successfully.")
- **Copy Subject** / **Copy Message** buttons (clipboard API with fallback)
- Graceful **pop-up blocker** detection and friendly error messaging
- Ripple button effect, hover animations, smooth scrolling
- Fully **responsive** (mobile + desktop) with a collapsible navbar
- **Keyboard accessible** (focus states, Enter/Space activation, ARIA attributes)
- No database, no external auth, no tracking, no stored data

---

## 🗂️ Folder Structure

```
project/
│
├── app.py                 # Flask application (factory pattern, routes, error handlers)
├── requirements.txt        # Python dependencies
├── README.md                # This file
│
├── templates/
│   └── index.html          # Single-page UI (hero, preview, FAQ, footer)
│
└── static/
    ├── style.css            # Dark glassmorphism styling, animations, responsive rules
    └── script.js            # Gmail URL builder, toasts, clipboard, ripple, navbar logic
```

---

## ⚙️ Requirements

- Python **3.10+** (tested with 3.14; any modern Python 3 works)
- pip

---

## 🚀 Installation & Local Setup

### 1. Clone / download the project

```bash
cd project
```

### 2. Create a virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Flask app

```bash
python app.py
```

By default the app runs at:

```
http://127.0.0.1:5000
```

Open that URL in your browser and click **"Compose Email"**.

> To enable debug/auto-reload during development, set the environment variable
> `FLASK_DEBUG=1` before running (e.g. `FLASK_DEBUG=1 python app.py`).
> **Never enable debug mode in production.**

---

## 🧪 Health Check

The app exposes a simple health check endpoint useful for uptime monitors and
hosting platforms:

```
GET /healthz  →  {"status": "ok", "service": "gmail-compose-launcher"}
```

---

## 🖼️ Screenshots

> Add your own screenshots here after running the app locally.

| Home / Compose | Email Preview | Toast Notification |
|---|---|---|
| _./screenshots/home.png_ | _./screenshots/preview.png_ | _./screenshots/toast.png_ |

---

## ☁️ Deployment

The app is a standard Flask app served via **gunicorn** in production, so it deploys
cleanly to most Python-friendly hosts. Below are instructions for three popular free/low-cost platforms.

### 1. Render

1. Push this project to a GitHub repository.
2. Go to [render.com](https://render.com) → **New +** → **Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Click **Create Web Service**. Render will build and deploy automatically on every push.

### 2. PythonAnywhere

1. Create a free account at [pythonanywhere.com](https://www.pythonanywhere.com).
2. Upload the project (via the **Files** tab or `git clone` in a Bash console).
3. Open a **Bash console** and install dependencies:
   ```bash
   pip install --user -r requirements.txt
   ```
4. Go to the **Web** tab → **Add a new web app** → choose **Flask** → select your
   Python version.
5. Set the **WSGI configuration file** to import your app:
   ```python
   import sys
   path = '/home/yourusername/project'
   if path not in sys.path:
       sys.path.append(path)
   from app import app as application
   ```
6. Set the **Source code** and **Working directory** to your project folder.
7. Click **Reload** on the Web tab. Your app will be live at `yourusername.pythonanywhere.com`.

### 3. Railway

1. Push this project to a GitHub repository.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Railway auto-detects Python. Add a **Start Command** under Settings → Deploy:
   ```bash
   gunicorn app:app
   ```
4. (Optional) Add an environment variable `SECRET_KEY` with a secure random value.
5. Railway will assign a public URL automatically — click **Generate Domain** under
   the Networking/Settings tab if one isn't created yet.

---

## 🔐 Privacy & Security Notes

- No login, signup, or password fields exist anywhere in this application.
- No email is ever sent from the server — the app only **constructs a URL**.
- No user data is collected, logged, or persisted (no database of any kind is used).
- Gmail opens in a new tab using `noopener,noreferrer` for security best practices.
- Set a strong `SECRET_KEY` environment variable in production even though this
  app doesn't use sessions today — it's a Flask best practice for future-proofing.

---

## 🛠️ Customization

To change the pre-filled recipient, subject, or message, edit the
`EMAIL_DETAILS` object at the top of `static/script.js`:

```javascript
const EMAIL_DETAILS = Object.freeze({
  to: 'minister.sm@gov.in,d.pradhan@sansad.nic.in',
  subject: 'Request for Resignation',
  body: 'Ddharmendra pradhan',
    'I respectfully request your resignation as the Education Minister. In my opinion, you have failed to meet the expectations of countless students across the country. Many people have lost confidence in your leadership, and I do not believe you deserve to continue serving in this position.

    I urge you to step down and allow someone who can work sincerely for the future of India's education system..
    Thank you.',
});
```

The preview section in `templates/index.html` (`#previewTo`, `#previewSubject`,
`#previewBody`) should be updated to match if you change these values.

---

## 📄 License

This project is provided as-is for educational and personal use.

---

Made with ❤️ using Flask.
