import { ipcMain, dialog, app, BrowserWindow, Menu } from "electron";
import { app as app2 } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import os from "os";
import fs from "fs";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const DB_DIR = path.join(os.homedir(), "AppData", "Local", "twitter-bookmarks");
const DB_PATH = path.join(DB_DIR, "bookmarks.db");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      tweet_url TEXT NOT NULL,
      full_text TEXT NOT NULL,
      author_name TEXT,
      author_handle TEXT,
      author_avatar_url TEXT,
      created_at TEXT,
      imported_at TEXT NOT NULL,
      like_count INTEGER DEFAULT 0,
      retweet_count INTEGER DEFAULT 0,
      has_media INTEGER DEFAULT 0,
      media_urls TEXT,
      urls TEXT,
      raw_json TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmark_tags (
      bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (bookmark_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
      id UNINDEXED, full_text, author_name, author_handle,
      content='bookmarks', content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS bookmarks_ai AFTER INSERT ON bookmarks BEGIN
      INSERT INTO bookmarks_fts(rowid, id, full_text, author_name, author_handle)
      VALUES (new.rowid, new.id, new.full_text, new.author_name, new.author_handle);
    END;

    CREATE TRIGGER IF NOT EXISTS bookmarks_ad AFTER DELETE ON bookmarks BEGIN
      DELETE FROM bookmarks_fts WHERE id = old.id;
    END;
  `);
}
function getBookmarks(filters = {}) {
  const { tag, search, author, limit = 20, offset = 0 } = filters;
  let query = `
    SELECT DISTINCT b.* FROM bookmarks b
    LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
    LEFT JOIN tags t ON bt.tag_id = t.id
    WHERE 1=1
  `;
  const params = [];
  if (tag) {
    query += ` AND t.name = ?`;
    params.push(tag);
  }
  if (author) {
    query += ` AND (b.author_handle LIKE ? OR b.author_name LIKE ?)`;
    params.push(`%${author}%`, `%${author}%`);
  }
  if (search) {
    query += ` AND EXISTS (
      SELECT 1 FROM bookmarks_fts WHERE bookmarks_fts.id = b.id
      AND bookmarks_fts MATCH ?
    )`;
    params.push(search);
  }
  query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  const stmt = db.prepare(query);
  return stmt.all(...params);
}
function getBookmarkById(id) {
  const stmt = db.prepare("SELECT * FROM bookmarks WHERE id = ?");
  return stmt.get(id);
}
function createBookmark(bookmark) {
  const stmt = db.prepare(`
    INSERT INTO bookmarks (
      id, tweet_url, full_text, author_name, author_handle,
      author_avatar_url, created_at, imported_at, like_count,
      retweet_count, has_media, media_urls, urls, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    bookmark.id,
    bookmark.tweet_url,
    bookmark.full_text,
    bookmark.author_name,
    bookmark.author_handle,
    bookmark.author_avatar_url,
    bookmark.created_at,
    bookmark.imported_at,
    bookmark.like_count || 0,
    bookmark.retweet_count || 0,
    bookmark.has_media ? 1 : 0,
    bookmark.media_urls ? JSON.stringify(bookmark.media_urls) : null,
    bookmark.urls ? JSON.stringify(bookmark.urls) : null,
    bookmark.raw_json ? JSON.stringify(bookmark.raw_json) : null
  );
}
function deleteBookmark(id) {
  const stmt = db.prepare("DELETE FROM bookmarks WHERE id = ?");
  return stmt.run(id);
}
function getAllTags() {
  const stmt = db.prepare(`
    SELECT t.*, COUNT(bt.bookmark_id) as count
    FROM tags t
    LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
    GROUP BY t.id
    ORDER BY t.name ASC
  `);
  return stmt.all();
}
function createTag(name, color = "#6366f1") {
  const stmt = db.prepare(`
    INSERT INTO tags (name, color, created_at)
    VALUES (?, ?, ?)
  `);
  return stmt.run(name, color, (/* @__PURE__ */ new Date()).toISOString());
}
function updateTag(id, { name, color }) {
  const stmt = db.prepare(`
    UPDATE tags SET name = ?, color = ? WHERE id = ?
  `);
  return stmt.run(name, color, id);
}
function deleteTag(id) {
  const stmt = db.prepare("DELETE FROM tags WHERE id = ?");
  return stmt.run(id);
}
function getBookmarkTags(bookmarkId) {
  const stmt = db.prepare(`
    SELECT t.* FROM tags t
    INNER JOIN bookmark_tags bt ON t.id = bt.tag_id
    WHERE bt.bookmark_id = ?
  `);
  return stmt.all(bookmarkId);
}
function setBookmarkTags(bookmarkId, tagIds) {
  const deleteStmt = db.prepare("DELETE FROM bookmark_tags WHERE bookmark_id = ?");
  deleteStmt.run(bookmarkId);
  const insertStmt = db.prepare(`
    INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)
  `);
  for (const tagId of tagIds) {
    insertStmt.run(bookmarkId, tagId);
  }
}
function getNote(bookmarkId) {
  const stmt = db.prepare(`
    SELECT * FROM notes WHERE bookmark_id = ? ORDER BY updated_at DESC LIMIT 1
  `);
  return stmt.get(bookmarkId);
}
function upsertNote(bookmarkId, content) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = db.prepare("SELECT id FROM notes WHERE bookmark_id = ? LIMIT 1").get(bookmarkId);
  if (existing) {
    const stmt = db.prepare(`
      UPDATE notes SET content = ?, updated_at = ? WHERE bookmark_id = ?
    `);
    return stmt.run(content, now, bookmarkId);
  } else {
    const stmt = db.prepare(`
      INSERT INTO notes (bookmark_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(bookmarkId, content, now, now);
  }
}
function deleteNote(bookmarkId) {
  const stmt = db.prepare("DELETE FROM notes WHERE bookmark_id = ?");
  return stmt.run(bookmarkId);
}
function getBookmarksWithTags(filters = {}) {
  const { tag, search, author, limit = 20, offset = 0 } = filters;
  const bookmarks = getBookmarks(filters);
  const bookmarkIds = bookmarks.map((b) => b.id);
  if (bookmarkIds.length === 0) {
    return bookmarks.map((b) => ({ ...b, tags: [] }));
  }
  const placeholders = bookmarkIds.map(() => "?").join(",");
  const stmt = db.prepare(`
    SELECT bt.bookmark_id, t.id, t.name, t.color, t.created_at
    FROM bookmark_tags bt
    INNER JOIN tags t ON bt.tag_id = t.id
    WHERE bt.bookmark_id IN (${placeholders})
  `);
  const allTags = stmt.all(...bookmarkIds);
  const tagsMap = {};
  for (const record of allTags) {
    if (!tagsMap[record.bookmark_id]) {
      tagsMap[record.bookmark_id] = [];
    }
    tagsMap[record.bookmark_id].push({
      id: record.id,
      name: record.name,
      color: record.color,
      created_at: record.created_at
    });
  }
  return bookmarks.map((b) => ({
    ...b,
    tags: tagsMap[b.id] || []
  }));
}
function getStats() {
  const bookmarksCount = db.prepare("SELECT COUNT(*) as count FROM bookmarks").get().count;
  const tagsCount = db.prepare("SELECT COUNT(*) as count FROM tags").get().count;
  const notesCount = db.prepare("SELECT COUNT(*) as count FROM notes").get().count;
  return { bookmarksCount, tagsCount, notesCount };
}
async function importBookmarks(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const jsonStr = raw.replace(/^window\.YTD\.bookmarks\.part\d+ = /, "").trim();
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (error) {
    throw new Error(`Erro ao fazer parse do JSON: ${error.message}`);
  }
  if (!Array.isArray(data)) {
    throw new Error("Formato de arquivo inválido");
  }
  let count = 0;
  for (const item of data) {
    if (!item.tweet) continue;
    const tweet = item.tweet;
    const id = tweet.id;
    const fullText = tweet.full_text || "";
    const tweetUrl = `https://twitter.com/${tweet.user?.screen_name}/status/${id}`;
    const existing = getBookmarkById(id);
    if (existing) continue;
    try {
      createBookmark({
        id,
        tweet_url: tweetUrl,
        full_text: fullText,
        author_name: tweet.user?.name || "Unknown",
        author_handle: tweet.user?.screen_name || "unknown",
        author_avatar_url: tweet.user?.profile_image_url_https || null,
        created_at: tweet.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        imported_at: (/* @__PURE__ */ new Date()).toISOString(),
        like_count: tweet.favorite_count || 0,
        retweet_count: tweet.retweet_count || 0,
        has_media: (tweet.extended_entities?.media?.length ?? 0) > 0,
        media_urls: tweet.extended_entities?.media?.map((m) => m.media_url_https) || null,
        urls: tweet.entities?.urls?.map((u) => ({ url: u.url, expanded_url: u.expanded_url })) || null,
        raw_json: tweet
      });
      count++;
    } catch (error) {
      console.error(`Erro ao inserir tweet ${id}:`, error);
    }
  }
  return count;
}
function registerIpcHandlers() {
  ipcMain.handle("bookmarks:get", (event, filters) => {
    return getBookmarks(filters);
  });
  ipcMain.handle("bookmarks:getWithTags", (event, filters) => {
    return getBookmarksWithTags(filters);
  });
  ipcMain.handle("bookmarks:getById", (event, id) => {
    return getBookmarkById(id);
  });
  ipcMain.handle("bookmarks:delete", (event, id) => {
    return deleteBookmark(id);
  });
  ipcMain.handle("tags:getAll", (event) => {
    return getAllTags();
  });
  ipcMain.handle("tags:create", (event, { name, color }) => {
    return createTag(name, color);
  });
  ipcMain.handle("tags:update", (event, { id, name, color }) => {
    return updateTag(id, { name, color });
  });
  ipcMain.handle("tags:delete", (event, id) => {
    return deleteTag(id);
  });
  ipcMain.handle("bookmarkTags:get", (event, bookmarkId) => {
    return getBookmarkTags(bookmarkId);
  });
  ipcMain.handle("bookmarkTags:set", (event, { bookmarkId, tagIds }) => {
    return setBookmarkTags(bookmarkId, tagIds);
  });
  ipcMain.handle("notes:get", (event, bookmarkId) => {
    return getNote(bookmarkId);
  });
  ipcMain.handle("notes:upsert", (event, { bookmarkId, content }) => {
    return upsertNote(bookmarkId, content);
  });
  ipcMain.handle("notes:delete", (event, bookmarkId) => {
    return deleteNote(bookmarkId);
  });
  ipcMain.handle("import:run", async (event) => {
    const result = await dialog.showOpenDialog({
      title: "Selecionar arquivo bookmarks.js",
      defaultPath: require2("os").homedir(),
      filters: [
        { name: "JSON", extensions: ["js"] },
        { name: "Todos", extensions: ["*"] }
      ]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: "Cancelado" };
    }
    try {
      const filePath = result.filePaths[0];
      const imported = await importBookmarks(filePath);
      return { success: true, imported, message: `${imported} bookmarks importados com sucesso` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });
  ipcMain.handle("app:getStats", (event) => {
    return getStats();
  });
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../../out/renderer/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function createMenu() {
  const template = [
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Sair",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit()
        }
      ]
    },
    {
      label: "Editar",
      submenu: [
        { label: "Desfazer", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Refazer", accelerator: "CmdOrCtrl+Y", role: "redo" },
        { type: "separator" },
        { label: "Cortar", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copiar", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Colar", accelerator: "CmdOrCtrl+V", role: "paste" }
      ]
    },
    {
      label: "Visualizar",
      submenu: [
        { role: "reload", label: "Recarregar" },
        { role: "forceReload", label: "Forçar Recarga" },
        { role: "toggleDevTools", label: "Ferramentas de Desenvolvedor" }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
app.on("ready", () => {
  initDb();
  registerIpcHandlers();
  createWindow();
  createMenu();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
export {
  app2 as default
};
