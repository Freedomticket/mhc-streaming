# Network Troubleshooting Guide

## Current Issue

You're experiencing network timeouts when trying to download packages from:
- NPM Registry (`https://registry.npmjs.org`)
- Prisma Binary Repository (`https://binaries.prisma.sh`)

This is affecting both Docker builds and local development setup.

## Possible Causes

1. **Firewall/Antivirus blocking outbound connections**
2. **VPN or Proxy configuration issues**
3. **Corporate network restrictions**
4. **DNS resolution problems**
5. **Windows Defender or other security software**

## Solutions to Try

### 1. Check Internet Connectivity

```powershell
# Test basic connectivity
Test-NetConnection www.google.com

# Test NPM registry
Test-NetConnection registry.npmjs.org -Port 443

# Test Prisma binaries
Test-NetConnection binaries.prisma.sh -Port 443
```

### 2. Check Windows Firewall

```powershell
# Check firewall status
Get-NetFirewallProfile | Select-Object Name, Enabled

# Temporarily disable Windows Firewall (for testing only)
# Run PowerShell as Administrator:
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Re-enable after testing
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### 3. Check for Proxy Settings

```powershell
# Check system proxy
netsh winhttp show proxy

# If you have a proxy, configure npm:
npm config set proxy http://proxy.example.com:8080
npm config set https-proxy http://proxy.example.com:8080

# Remove proxy if not needed:
npm config delete proxy
npm config delete https-proxy
```

### 4. Flush DNS Cache

```powershell
# Clear DNS cache
Clear-DnsClientCache
ipconfig /flushdns
```

### 5. Try Alternative NPM Registry

```powershell
# Use alternative registry
npm config set registry https://registry.npmmirror.com

# Or use Cloudflare
npm config set registry https://cloudflare-npm.com/npm/

# Reset to default
npm config set registry https://registry.npmjs.org/
```

### 6. Configure Prisma to Skip Binary Download

Since Prisma binaries aren't downloading, you can try using a pre-built binary:

```powershell
# Set environment variable to skip download
$env:PRISMA_CLI_BINARY_TARGETS="native"
$env:PRISMA_SKIP_POSTINSTALL_GENERATE="true"
```

### 7. Check Antivirus/Security Software

Temporarily disable antivirus (like Windows Defender, Norton, McAfee, etc.) and try again.

### 8. Use Mobile Hotspot (Quick Test)

If you have a mobile device:
1. Create a mobile hotspot from your phone
2. Connect your computer to it
3. Try running the commands again

This will quickly tell you if it's a network configuration issue.

## Next Steps After Fixing Network

Once network connectivity is restored:

```powershell
# 1. Generate Prisma client
npm run db:generate --workspace=@mhc/database

# 2. Push database schema
npm run db:push --workspace=@mhc/database

# 3. Build shared packages
npm run build --workspace=@mhc/database
npm run build --workspace=@mhc/common

# 4. Try Docker build again
docker-compose up -d --build auth-service
```

## Alternative: Work Offline (Limited)

If you can't fix network issues immediately, you could:
1. Use a different machine/network to download node_modules
2. Copy them to this machine
3. Continue development

But this won't work for Prisma binaries which are platform-specific.

## Current Infrastructure Status

✅ PostgreSQL is running (port 5432)
✅ Redis is running (port 6379)

Once network is fixed, you'll be able to:
- Generate Prisma client
- Build services in Docker
- Run services locally
