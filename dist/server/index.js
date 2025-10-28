// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables for backend");
}
var supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
var supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// server/routes.ts
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/profile", authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("user_id", req.user.id).single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/profile", authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").insert([{
        user_id: req.user.id,
        ...req.body
      }]).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/profile", authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").update(req.body).eq("user_id", req.user.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/discovery", authenticateUser, async (req, res) => {
    try {
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("profiles").select("*").neq("user_id", req.user.id).not("id", "in", `(
          SELECT swiped_id FROM swipes WHERE swiper_id = '${currentProfile.id}'
        )`).not("id", "in", `(
          SELECT blocked_id FROM blocks WHERE blocker_id = '${currentProfile.id}'
        )`).limit(20);
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/swipe", authenticateUser, async (req, res) => {
    try {
      const { swiped_id, action } = req.body;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("swipes").insert([{
        swiper_id: currentProfile.id,
        swiped_id,
        action
      }]).select().single();
      if (error) throw error;
      if (action === "like") {
        const { data: reverseSwipe } = await supabaseAdmin.from("swipes").select("*").eq("swiper_id", swiped_id).eq("swiped_id", currentProfile.id).eq("action", "like").single();
        if (reverseSwipe) {
          res.json({ ...data, isMatch: true });
          return;
        }
      }
      res.json({ ...data, isMatch: false });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/matches", authenticateUser, async (req, res) => {
    try {
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("matches").select(`
          *,
          user1:profiles!matches_user1_id_fkey(*),
          user2:profiles!matches_user2_id_fkey(*)
        `).or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`).order("matched_at", { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/messages/:matchId", authenticateUser, async (req, res) => {
    try {
      const { matchId } = req.params;
      const { data, error } = await supabaseAdmin.from("messages").select("*").eq("match_id", matchId).order("created_at", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/messages", authenticateUser, async (req, res) => {
    try {
      const { match_id, content, type = "text" } = req.body;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("messages").insert([{
        match_id,
        sender_id: currentProfile.id,
        content,
        type
      }]).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/messages/:messageId/read", authenticateUser, async (req, res) => {
    try {
      const { messageId } = req.params;
      const { data, error } = await supabaseAdmin.from("messages").update({ is_read: true }).eq("id", messageId).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/block", authenticateUser, async (req, res) => {
    try {
      const { blocked_id } = req.body;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("blocks").insert([{
        blocker_id: currentProfile.id,
        blocked_id
      }]).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/block/:blockedId", authenticateUser, async (req, res) => {
    try {
      const { blockedId } = req.params;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { error } = await supabaseAdmin.from("blocks").delete().eq("blocker_id", currentProfile.id).eq("blocked_id", blockedId);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/report", authenticateUser, async (req, res) => {
    try {
      const { reported_id, reason } = req.body;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("reports").insert([{
        reporter_id: currentProfile.id,
        reported_id,
        reason
      }]).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/interests", async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from("interests").select("*").order("category", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      log(`${req.method} ${path3} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});
var server = await registerRoutes(app);
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${message}`);
  res.status(status).json({ error: message });
});
serveStatic(app);
var index_default = async (req, res) => {
  return app(req, res);
};
export {
  index_default as default
};
