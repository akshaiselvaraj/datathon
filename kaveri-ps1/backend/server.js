const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Emulate Zoho Catalyst Request-Response Context API wrapper
function runCatalystFunction(handlerPath) {
  return async (req, res) => {
    console.log(`[Catalyst Emulator] Triggered function: ${path.basename(path.dirname(handlerPath))} (${req.method})`);
    
    // Clear cache to allow modifications to code without rebooting server
    delete require.cache[require.resolve(handlerPath)];
    const handler = require(handlerPath);

    let isClosed = false;

    const context = {
      close: () => {
        isClosed = true;
        console.log(`[Catalyst Emulator] Context closed for function.`);
      }
    };

    const basicIO = {
      getReferrerReq: () => req,
      getReferrerRes: () => res,
      getParameter: (name) => req.query[name] || req.body[name],
      write: (data) => {
        if (!res.headersSent) {
          if (typeof data === 'object') {
            res.json(data);
          } else {
            res.send(data);
          }
        }
      }
    };

    try {
      await handler(context, basicIO);
    } catch (err) {
      console.error("[Catalyst Emulator] Execution Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  };
}

// Register API routes
app.post('/chat', runCatalystFunction('./functions/chat/index.js'));
app.post('/graph', runCatalystFunction('./functions/graph/index.js'));
app.get('/analytics', runCatalystFunction('./functions/analytics/index.js'));
app.all('/alerts', runCatalystFunction('./functions/alerts/index.js'));
app.post('/translate', runCatalystFunction('./functions/translate/index.js'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`KAVERI Local Backend Emulator started on port ${PORT}`);
  console.log(`API endpoints mapped:`);
  console.log(`  - POST http://localhost:${PORT}/chat (RAG + LLM call)`);
  console.log(`  - POST http://localhost:${PORT}/graph (Criminal Network queries)`);
  console.log(`  - GET  http://localhost:${PORT}/analytics (Incident aggregation metrics)`);
  console.log(`  - GET  http://localhost:${PORT}/alerts (Incident Spikes Anomaly logs)`);
  console.log(`  - POST http://localhost:${PORT}/translate (Kannada text translator)`);
  console.log(`=======================================================`);
});
