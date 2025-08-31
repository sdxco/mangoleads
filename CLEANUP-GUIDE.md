# Files and folders to clean up - Manual cleanup checklist

## 🗑️ Remove These Files (Keep your originals safe first!)

### Root Level - Remove:
- api-tests.http (old version)
- diagnostic.js
- manual-entry.html (duplicated)
- manual-entry.js (duplicated) 
- queue-validation.js
- queue.js
- redis-check.js
- server.js (old version)
- smoke-test.js
- status.js
- test-api.js
- test-external-integration.js
- test-lead.js
- test-setup.js

### Keep These Important Files:
- README.md
- package.json (main)
- .gitignore
- LICENSE
- CHANGELOG.md
- vercel.json
- DEPLOYMENT.md
- start.sh

### Folders to Keep:
- /database (your current schema)
- /public (your current CRM)
- /src (your current models)
- /server (our new v2 implementation)
- /landing-page (separate landing pages)

## 🎯 Clean Project Structure:
```
/mangoleads
  /database          ← Your current database schema
  /public            ← Your current CRM (will upgrade this)
  /server            ← New v2 API server
  /src               ← Your current models
  /landing-page      ← Landing pages
  README.md
  package.json
  .gitignore
  LICENSE
```

## 📋 Manual Steps:
1. Backup your current folder first
2. Delete the files listed above
3. Test that everything still works
4. Then we'll upgrade the CRM interface
