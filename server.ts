import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending emails
  app.post("/api/send-email", (req, res) => {
    const { to, subject, body, type } = req.body;
    
    // In a real app, you would use a service like Resend, SendGrid, or Mailgun here.
    // For this demonstration, we'll log the "email" to the console.
    console.log("-----------------------------------------");
    console.log(`ENVIANDO E-MAIL (${type || 'GERAL'}):`);
    console.log(`PARA: ${to}`);
    console.log(`ASSUNTO: ${subject}`);
    console.log(`CORPO: \n${body}`);
    console.log("-----------------------------------------");

    // Simulate a slight delay
    setTimeout(() => {
      res.json({ 
        success: true, 
        message: "E-mail enviado com sucesso!",
        details: { to, subject, type }
      });
    }, 1000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
