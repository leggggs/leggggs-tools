# Deploying the Leggggs Nickname Generator to Vercel

## What you have
- `public/index.html` — the tool itself
- `api/generate.js` — the serverless function (keeps your API key safe)
- `vercel.json` — tells Vercel how to wire it together

---

## Step 1: Get a free Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **API Keys** → **Create Key**
4. Copy it — you'll need it in Step 4

---

## Step 2: Push this folder to GitHub
1. Go to https://github.com and create a new repository (call it `leggggs-tools` or anything)
2. Upload these three files maintaining the folder structure:
   - `api/generate.js`
   - `public/index.html`
   - `vercel.json`
3. Commit and push

---

## Step 3: Connect to Vercel
1. Go to https://vercel.com and sign up (free — use your GitHub login)
2. Click **Add New Project**
3. Import your `leggggs-tools` GitHub repo
4. Click **Deploy** — leave all settings as default

---

## Step 4: Add your API key
1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your Anthropic API key
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deploy → **Redeploy**

Your tool is now live at `https://your-project-name.vercel.app`

---

## Step 5: Embed in WordPress.com
1. In WordPress, go to the page or post where you want the tool
2. Add a new block → search for **Custom HTML**
3. Paste this (swap in your actual Vercel URL):

```html
<iframe 
  src="https://your-project-name.vercel.app" 
  width="100%" 
  height="900" 
  frameborder="0" 
  style="border:none; max-width:100%;">
</iframe>
```

4. Adjust the `height` value if you need more or less space (900px is a safe starting point)

---

## Notes
- Vercel free tier is very generous — this will cost you nothing
- Every time you update the files on GitHub, Vercel redeploys automatically
- Your API key is never exposed to visitors — it lives only in Vercel's environment
