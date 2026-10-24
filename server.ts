import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const CONFIG_FILE = path.resolve(process.cwd(), 'supabase-config.json');

app.use(express.json());

// Helper to read server-persisted Supabase config
function readServerConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading server config:', err);
  }

  // Fallback to process.env or built-in credentials
  const envUrl = process.env.VITE_SUPABASE_URL || 'https://agpvsaybtudoyjpfoqwn.supabase.co';
  const envKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncHZzYXlidHVkb3lqcGZvcXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNzQzODUsImV4cCI6MjEwNzk1MDM4NX0.PcfO-6o_iGfYmLv-mTNVZSqO3eIdqd3eE-FN9jAuCII';
  
  return {
    url: envUrl,
    anonKey: envKey,
    tableNameSidang: 'peserta_sidang',
    tableNameNilai: 'penilaian_sidang',
  };
}

// Helper to write server-persisted Supabase config
function writeServerConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    
    // Also write or update .env so Vite injects it into client env if rebuilt
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      
      const lines = envContent.split('\n');
      let urlSet = false;
      let keySet = false;
      const updatedLines = lines.map((l) => {
        if (l.startsWith('VITE_SUPABASE_URL=')) {
          urlSet = true;
          return `VITE_SUPABASE_URL="${config.url}"`;
        }
        if (l.startsWith('VITE_SUPABASE_ANON_KEY=')) {
          keySet = true;
          return `VITE_SUPABASE_ANON_KEY="${config.anonKey}"`;
        }
        return l;
      });
      if (!urlSet) updatedLines.push(`VITE_SUPABASE_URL="${config.url}"`);
      if (!keySet) updatedLines.push(`VITE_SUPABASE_ANON_KEY="${config.anonKey}"`);
      fs.writeFileSync(envPath, updatedLines.filter(Boolean).join('\n') + '\n', 'utf-8');
    } catch (e) {
      console.warn('Could not update .env file:', e);
    }

    return true;
  } catch (err) {
    console.error('Error writing server config:', err);
    return false;
  }
}

// API: Get Supabase Configuration (so any computer connects automatically)
app.get('/api/supabase-config', (req, res) => {
  const config = readServerConfig();
  if (config && config.url && config.anonKey) {
    return res.json({ success: true, config });
  }
  return res.json({ success: false, config: null });
});

// API: Save Supabase Configuration (persisted across all computers)
app.post('/api/supabase-config', (req, res) => {
  const { url, anonKey, tableNameSidang, tableNameNilai } = req.body;
  if (!url || !anonKey) {
    return res.status(400).json({ success: false, message: 'URL and Anon Key are required.' });
  }

  const newConfig = {
    url: String(url).trim(),
    anonKey: String(anonKey).trim(),
    tableNameSidang: tableNameSidang || 'peserta_sidang',
    tableNameNilai: tableNameNilai || 'penilaian_sidang',
    updatedAt: new Date().toISOString(),
  };

  const saved = writeServerConfig(newConfig);
  if (saved) {
    return res.json({ success: true, message: 'Supabase configuration saved on server.', config: newConfig });
  }
  return res.status(500).json({ success: false, message: 'Failed to write configuration file.' });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Full-Stack Server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
