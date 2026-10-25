# Hostinger VPS & Dokploy Deployment Guide

This guide explains how to deploy the **Soloshine Backend** on a **Hostinger VPS** using **Dokploy**, with images and PDFs stored directly on the server with **persistent storage**.

---

## 📌 Architecture Overview

- **Server**: Hostinger VPS (Ubuntu 22.04 / 24.04 LTS).
- **Control Panel**: Dokploy (running on Docker + Traefik Reverse Proxy with auto-SSL).
- **Backend**: Node.js 20 Express API running in a Docker container on port `3000`.
- **Media Storage (Images & PDFs)**: Stored inside `/app/uploads` on the server and mounted to a **Dokploy Persistent Volume** (`soloshine_uploads`), ensuring files **never get lost** during container rebuilds, updates, or restarts.
- **Static File Serving**: Served directly by the backend at `https://your-domain.com/uploads/...`.

---

## 🚀 Step 1: Install Dokploy on your Hostinger VPS (If Not Yet Installed)

If you haven't installed Dokploy on your Hostinger VPS yet:

1. Connect to your VPS via SSH (from PowerShell or Terminal):
   ```bash
   ssh root@YOUR_HOSTINGER_VPS_IP
   ```
2. Run the official Dokploy one-line installer:
   ```bash
   curl -sSL https://dokploy.com/install.sh | sh
   ```
3. Once installation completes, open your browser and navigate to:
   ```text
   http://YOUR_HOSTINGER_VPS_IP:3000
   ```
4. Create your Dokploy admin account (Username & Password).

---

## 📦 Step 2: Push Your Code to GitHub / Git Repository

Make sure your latest code with the new `Dockerfile`, `.dockerignore`, and updated storage manager is committed and pushed:

```bash
git add .
git commit -m "feat: configure Dokploy deployment and server-side local storage for images and pdfs"
git push origin main
```

---

## ⚙️ Step 3: Create the Application in Dokploy

1. In the Dokploy Dashboard, select or create a **Project** (e.g., `Soloshine`).
2. Click **Add Service** -> **Application**.
3. Set a name: `soloshine-backend`.
4. Under **Source**:
   - Choose **GitHub** (or **Git Repository**).
   - Select your repository (`Muthaji-mumbai/soloshine_backend`).
   - Branch: `main` (or your active branch).
   - Build Type: **Dockerfile**.
   - Dockerfile path: `./Dockerfile`.
   - Context path: `.`.

---

## 💾 Step 4: Configure Persistent Volume for Images & PDFs (CRITICAL!)

> [!IMPORTANT]
> Without a persistent volume, Docker will store uploaded images and PDFs inside temporary container memory. Whenever Dokploy rebuilds or redeploys the container, all images and PDFs would be deleted!
> Follow these steps to persist your uploads on the Hostinger VPS disk:

1. Inside your application in Dokploy, go to the **Mounts** (or **Volumes**) tab.
2. Click **Add Mount** / **Add Volume**.
3. Choose one of the two options:

### Option A: Named Docker Volume (Recommended)
- **Type**: `Volume`
- **Volume Name**: `soloshine_uploads`
- **Mount Path**: `/app/uploads`

### Option B: Host Bind Mount
- **Type**: `Bind`
- **Host Path**: `/etc/dokploy/volumes/soloshine/uploads`
- **Mount Path**: `/app/uploads`

4. Click **Save** / **Apply**.

Now, all images and PDFs saved to `/app/uploads/images` and `/app/uploads/pdfs` will live permanently on your VPS hard drive!

---

## 🔑 Step 5: Configure Environment Variables

1. Go to the **Environment** tab of your application in Dokploy.
2. Add the following variables (copy and modify with your actual credentials):

```env
PORT=3000
NODE_ENV=production

# The public URL of your backend (Domain or VPS IP)
# This is used to generate image and PDF URLs sent back to the frontend/client
SERVER_URL=https://api.yourdomain.com

# Use local server disk for images and PDFs
STORAGE_DRIVER=local

# MongoDB Database Connection
DATA_BASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/soloshine?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET_KEY=your_secure_jwt_secret_key_here

# Firebase Admin (If push notifications are enabled)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

3. Click **Save**.

---

## 🌐 Step 6: Configure Domain & SSL Certificate

1. **DNS Setup**:
   - Go to your Domain Registrar / DNS Manager (Hostinger, Cloudflare, Namecheap, etc.).
   - Create an **A record**:
     - **Host**: `api` (or `@` if using root domain)
     - **Points to**: `YOUR_HOSTINGER_VPS_IP`
2. **Dokploy Domain Setup**:
   - Go to the **Domains** tab in your Dokploy application.
   - Click **Add Domain**.
   - Host: `api.yourdomain.com` (your configured domain).
   - Container Port: `3000`.
   - Check **HTTPS / Let's Encrypt SSL** to enable automatic SSL certificate.
   - Click **Save**.

---

## 🚀 Step 7: Deploy and Verify

1. Click **Deploy** in the top-right corner of Dokploy.
2. Watch the deployment logs in real-time.
3. Once deployed, test the health check in your browser or with curl:
   ```bash
   curl https://api.yourdomain.com/health
   ```
   **Expected Response:**
   ```json
   {
     "status": "ok",
     "uptime": 12.34,
     "timestamp": "2026-10-25T11:30:00.000Z"
   }
   ```
4. Test image / PDF uploads:
   - When orders are created or updated with images or PDFs, they are saved locally to:
     - Images: `https://api.yourdomain.com/uploads/images/<filename>`
     - PDFs: `https://api.yourdomain.com/uploads/pdfs/<filename>`
5. Test Storage Statistics:
   - Go to `GET /dashboard/storage` (requires admin token).
   - You will see the `serverStorage` section showing real-time disk usage of `uploads/` on your Hostinger VPS.

---

## 🔄 Step 8: Automatic Deployments (CI/CD)

1. In Dokploy, go to the **Deployments** tab.
2. Copy the **Webhook URL**.
3. In GitHub:
   - Go to your repository -> **Settings** -> **Webhooks** -> **Add Webhook**.
   - Paste the Webhook URL.
   - Content type: `application/json`.
   - Trigger: `Just the push event`.
4. Now, whenever you push code changes to GitHub, Dokploy will automatically rebuild and deploy without touching your uploaded images or PDFs!
