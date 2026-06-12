Here is the **complete README** – copy everything below into your `README.md` file:

```markdown
# PassIntell Pro 🔐

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://rudreshark.github.io/PasswordIntelligencePro/)

**PassIntell Pro** is a privacy-first, client‑side password intelligence platform. It helps you assess, generate, and manage passwords — but **never stores your generated passwords**. Every password is produced **once** and must be saved manually if needed. All analysis (strength, entropy, breach status) happens live, using the **Have I Been Pwned (HIBP) API** with k‑anonymity.

> ✅ No server-side logging of plaintext passwords  
> ✅ No history of previously generated passwords – each generation is fresh  
> ✅ Compare two passwords in real time  
> ✅ Generate strong passwords **or** memorable passphrases  
> ✅ Encrypted local vault for manual storage

---

## ✨ Key Features (as the site actually works)

### 1. Live Dual Password Comparison
- Enter two different passwords side by side.
- Each password is analysed **instantly** for:
  - Entropy (bits of randomness)
  - Character set diversity (lower, upper, digits, symbols)
  - Length and complexity score
- Visual bars and colour‑coded feedback.

### 2. Password & Passphrase Generator
- **No “previously generated” list** – each click produces a **single new password** or passphrase.
- Two generation modes:
  - **Password** – fully random characters (configurable length & character types).
  - **Passphrase** – human‑readable words separated by symbols (e.g., `correct-horse-battery-staple`).
- Generated output is immediately analysed by the same strength engine.

### 3. HIBP Breach Intelligence (on every password)
- Whether you type a password or generate one, the tool:
  - Computes its SHA‑1 hash.
  - Sends only the **first 5 characters** (k‑anonymity) to the HIBP API.
  - Returns a clear message: *“This password has appeared in X breaches”* or *“No breaches found”*.
- This check is available in:
  - The comparison section (both passwords)
  - The generator output area
  - The vault (when you review a saved password)

### 4. Encrypted Local Vault
- You can **manually save** generated or existing passwords into a browser‑based vault.
- The vault is encrypted using a key derived from a master passphrase (never sent anywhere).
- You can add, view, or delete entries – each entry can be re‑analysed (breach check) at any time.
- **Note:** The vault does **not** autosave generated passwords; you must explicitly store what you need.

### 5. Guided User Feedback
- Every analysis explains **why** a password is weak/strong.
- Suggestions include: add more symbols, increase length, avoid dictionary words, etc.
- Breach results come with actionable advice (e.g., “Never reuse this password”).

---

## 🚀 Live Demo

Experience it directly:  
[https://rudreshark.github.io/PasswordIntelligencePro/](https://rudreshark.github.io/PasswordIntelligencePro/)

---

## 🧰 How It Works (Technical Summary)

| Component          | Implementation                                                                 |
|--------------------|--------------------------------------------------------------------------------|
| **Entropy & strength** | Calculated client‑side using character set size and length (`log2(N^L)`).     |
| **Breach checking**    | HIBP API v3 (k‑anonymity) – only the first 5 chars of SHA‑1 hash are sent.   |
| **Password generation**| `window.crypto.getRandomValues()` – cryptographically secure.                 |
| **Passphrase generation**| Diceware‑style word list (local) + random separator.                         |
| **Local vault**        | AES‑GCM encryption via Web Crypto API, stored in `localStorage`.             |
| **Comparison**         | Two independent instances of the same analyser, updated on every keystroke.  |

**No backend required** – the entire application runs in your browser. The optional server (in the repo) is only for those who want to log telemetry to Supabase; it is **not** needed for core functionality.

---

## 📦 Quick Start (Run Locally)

```bash
git clone https://github.com/rudreshark/PasswordIntelligencePro.git
cd PasswordIntelligencePro/client
npm install
npm run dev
```

Then open `http://localhost:8080`.

> The **server** folder is optional. If you want full local testing with the API proxy, run `cd ../server && npm install && npm start` in another terminal.

---

## 🧪 Deployment on GitHub Pages (Recommended)

Because the project is client‑side only, you can deploy directly from the `/client` folder:

1. In your repo, go to **Settings → Pages**.
2. Set **Source** to `GitHub Actions`.
3. Use the following workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
    paths: ["client/**"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd client && npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./client/dist
```

4. After the first deploy, your site will be live at `https://rudreshark.github.io/PasswordIntelligencePro/`.

---

## 📁 Project Structure (Relevant Parts)

```
PasswordIntelligencePro/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PasswordComparison.tsx   # live two‑field analysis
│   │   │   ├── PasswordGenerator.tsx    # password + passphrase (no history)
│   │   │   ├── Vault.tsx                # encrypted local storage
│   │   │   └── BreachAlert.tsx          # HIBP integration
│   │   ├── utils/
│   │   │   ├── strength.ts              # entropy, complexity
│   │   │   ├── hibp.ts                  # k‑anonymity breach check
│   │   │   └── encryption.ts            # vault encryption
│   │   └── App.tsx
│   └── package.json
├── server/           # optional (telemetry logging only)
└── README.md
```

---

## 🛡️ Privacy & Security Guarantees

- **No generated password is ever stored** – not even in browser memory after page reload.
- **No history** – the generator does not keep a list of previously created passwords.
- **HIBP requests are k‑anonymous** – your full password never leaves your device.
- **Vault is encrypted** – you hold the key; no one else can decrypt it, not even the site author.

---

## 🤝 Contributing

Found a bug? Want to improve the passphrase word list? Open an issue or a pull request.  
Please follow standard GitHub flow – fork, branch, commit, push, PR.

---

## 📄 License

MIT – use it freely, but remember: **security is a shared responsibility**.

---

**Built for those who want honest password intelligence, without the gimmicks.**
```

