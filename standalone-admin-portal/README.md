# Thai Samnang 1/99 — Standalone Master & Admin Console

This is the completely independent, standalone back-office management console for the **Thai Samnang 1/99 Lottery System**.

It is completely separated from the player gaming website (`https://lottery888.win/`). You can deploy this project to its own separate domain or subdomain (for example: `https://admin.lottery888.win` or `https://master.lottery888.win`).

---

## 🚀 Features Included
1. **Master & Admin Authentication**:
   - High security login portal isolated from regular players.
   - Master accounts & Admin privileges.
2. **Member & Agent Account Management**:
   - Add new player accounts, agents, and sub-masters.
   - **Password Control**: View and change player passwords anytime.
   - **Wallet Management**: Top up or deduct balance with 1 click.
   - **Account Security**: Suspend or reactivate compromised accounts.
3. **Live Draw Controller**:
   - Trigger instant draw (`ចេញលទ្ធផលភ្លាមៗ (Draw Now)`).
   - Set preset/forced winning numbers for channels A, B, C, D, E.
4. **Wagers & Bet Audit**:
   - Real-time audit of all player tickets.
   - Settle manual wins/losses or void tickets with immediate refund.
5. **System Rules & Odds Configuration**:
   - Configure payout rates (e.g. 91x).
   - Adjust round countdown interval (seconds).
   - Set minimum and maximum bet amounts.
6. **Past Results Archive**:
   - Search, verify, or remove past round draw records.

---

## 🛠️ How to Run & Deploy

### Option 1: Deploy on Vercel (Recommended - Free & Fast)
1. Push this folder to a GitHub repository or drag-and-drop the unzipped folder into Vercel.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Go to **Settings -> Domains** in Vercel and add your custom domain:
   - Example: `admin.lottery888.win`
6. Add the CNAME record in your DNS provider (Cloudflare / Namecheap / GoDaddy) pointing to `cname.vercel-dns.com`.

### Option 2: Deploy on Netlify
1. Log into [Netlify](https://www.netlify.com/).
2. Drag and drop the `dist` folder generated after running `npm run build`, or connect GitHub.
3. Add your custom domain `admin.lottery888.win`.

### Option 3: Deploy on VPS or Nginx
1. Build the production bundle:
   ```bash
   npm install
   npm run build
   ```
2. Upload the contents of the `dist/` directory to your web server (e.g., `/var/www/admin.lottery888.win/html`).
3. Set up your Nginx config:
   ```nginx
   server {
       listen 80;
       server_name admin.lottery888.win;
       root /var/www/admin.lottery888.win/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

---

## 🔑 Default Credentials
- **Admin**:
  - User ID: `admin`
  - Password: `admin888`
- **Master**:
  - User ID: `MASTER_01`
  - Password: `master888`
