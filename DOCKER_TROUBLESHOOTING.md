# Docker Desktop Troubleshooting - Windows

## Common Docker Issues & Fixes

### Issue 1: "Docker daemon not running"
**Fix:**
1. Close Docker Desktop completely
2. Open Task Manager → End all Docker processes
3. Restart Docker Desktop as **Administrator**
4. Wait 2-3 minutes for it to fully start

### Issue 2: WSL 2 Error
**Fix:**
```powershell
# Run as Administrator
wsl --update
wsl --set-default-version 2
```

### Issue 3: "Docker failed to initialize"
**Fix:**
1. Uninstall Docker Desktop completely
2. Delete folders:
   - `C:\Program Files\Docker`
   - `C:\ProgramData\Docker`
   - `%APPDATA%\Docker`
3. Restart computer
4. Reinstall Docker Desktop
5. **Enable WSL 2** during installation

### Issue 4: Hyper-V Conflict
**Fix:**
```powershell
# Run as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```
Then restart computer.

### Issue 5: "Access Denied" on docker-compose
**Fix:**
- Run PowerShell as Administrator
- Or: Add your user to "docker-users" group:
  - Computer Management → Local Users and Groups → Groups → docker-users
  - Add your user → Restart

---

## ✅ Verify Docker is Working

Once Docker Desktop shows "Engine running":

```powershell
# These should all work:
docker --version
docker ps
docker-compose --version
```

---

## 🚀 Start MHC Services (Run After Docker Works)

```powershell
# 1. Start databases first
docker-compose up -d postgres redis

# 2. Wait 30 seconds
Start-Sleep -Seconds 30

# 3. Start all services
docker-compose up -d

# 4. Check everything is running
docker-compose ps

# 5. View logs
docker-compose logs -f
```

---

## 🧪 Test Services Are Working

```powershell
# Test auth service
curl http://localhost:3001/health

# Test media service  
curl http://localhost:3002/health

# Test payment service
curl http://localhost:3004/health
```

All should return `{"status":"ok"}`

---

## 🆘 If Still Failing

### Nuclear Option (Fresh Start):
1. Uninstall Docker Desktop
2. Delete ALL Docker folders
3. Restart computer
4. Download fresh Docker Desktop installer
5. Run installer as Administrator
6. Select "Use WSL 2 instead of Hyper-V"
7. Restart computer again
8. Start Docker Desktop

### Alternative: Use Without Docker
If Docker keeps failing, we can run services directly:
- Postgres: Install PostgreSQL separately
- Redis: Install Redis for Windows
- Services: Run with `npm run dev` in each service folder

(Less ideal, but will work if Docker won't cooperate)

---

## 📞 Once Docker Works

Message me and I'll help you:
1. Start all services
2. Test auth/media/payment endpoints
3. Create payment checkout endpoint
4. Wire up frontend APIs
5. Test complete artist flow

**Estimate: 1-2 hours to fully working** once Docker is stable!
