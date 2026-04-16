# Uncanny Face Detector API

This service hosts your PCA + MTCNN uncanny face transformation so the React portfolio can call it.

## 1) Prepare the model

Use your original training repo to generate `pca_model.pkl`, then copy it into:

`uncanny-api/models/pca_model.pkl`

## 2) Install dependencies

```bash
cd uncanny-api
pip install -r requirements.txt
```

## 3) Run the API

```bash
uvicorn app:app --reload --port 8000
```

## 4) Run the React app

From project root:

```bash
npm run dev
```

Or run both frontend + API from project root:

```bash
npm run dev:all
```

The page is available at:

`/uncanny-face-detector`

Optional: set a custom API base URL in a `.env` file at project root:

`VITE_UNCANNY_API_URL=http://127.0.0.1:8000`
