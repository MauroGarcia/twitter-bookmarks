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
const isTestDb = process.env.TEST_DB === "true";
const DB_DIR = isTestDb ? path.join(process.cwd(), "tests", ".tmp") : path.join(os.homedir(), "AppData", "Local", "twitter-bookmarks");
const DB_PATH = isTestDb ? path.join(DB_DIR, "bookmarks.test.db") : path.join(DB_DIR, "bookmarks.db");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
function escapeLike(value) {
  return `${value}`.replace(/[\\%_]/g, "\\$&");
}
function buildFtsMatchQuery(value) {
  const tokens = `${value}`.trim().toLowerCase().match(/[^\s"']+/g);
  if (!tokens || tokens.length === 0) {
    return null;
  }
  return tokens.map((token) => token.replace(/"/g, '""')).filter(Boolean).map((token) => `"${token}"*`).join(" AND ");
}
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

    CREATE TRIGGER IF NOT EXISTS bookmarks_au AFTER UPDATE ON bookmarks BEGIN
      UPDATE bookmarks_fts
      SET full_text = new.full_text,
          author_name = new.author_name,
          author_handle = new.author_handle
      WHERE rowid = new.rowid;
    END;

    CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags(bookmark_id);
    CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id_bookmark_id ON bookmark_tags(tag_id, bookmark_id);
    CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
  `);
}
function getBookmarks(filters = {}) {
  const { tag, search, author, limit = 20, offset = 0 } = filters;
  const params = [];
  const joins = [];
  const conditions = [];
  if (tag) {
    joins.push("INNER JOIN bookmark_tags bt ON b.id = bt.bookmark_id");
    joins.push("INNER JOIN tags t ON bt.tag_id = t.id");
    conditions.push("t.name = ?");
    params.push(tag);
  }
  if (author) {
    const escapedAuthor = escapeLike(author);
    conditions.push(`(b.author_handle LIKE ? ESCAPE '\\' OR b.author_name LIKE ? ESCAPE '\\')`);
    params.push(`%${escapedAuthor}%`, `%${escapedAuthor}%`);
  }
  if (search) {
    const matchQuery = buildFtsMatchQuery(search);
    if (matchQuery) {
      joins.push("INNER JOIN bookmarks_fts ON bookmarks_fts.rowid = b.rowid");
      conditions.push("bookmarks_fts MATCH ?");
      params.push(matchQuery);
    }
  }
  let query = `SELECT b.* FROM bookmarks b`;
  if (joins.length > 0) {
    query += ` ${joins.join(" ")}`;
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
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
  const insertInTransaction = db.transaction(() => {
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
        throw new Error(`Erro ao inserir tweet ${id}: ${error.message}`);
      }
    }
    return count;
  });
  return insertInTransaction();
}
function createErrorHandler(handlerName, handler) {
  return async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      console.error(`[IPC Handler Error] ${handlerName}:`, error);
      throw new Error(`Erro em ${handlerName}: ${error.message}`);
    }
  };
}
function registerIpcHandlers() {
  ipcMain.handle("bookmarks:get", createErrorHandler("bookmarks:get", (event, filters) => {
    return getBookmarks(filters);
  }));
  ipcMain.handle("bookmarks:getWithTags", createErrorHandler("bookmarks:getWithTags", (event, filters) => {
    return getBookmarksWithTags(filters);
  }));
  ipcMain.handle("bookmarks:getById", createErrorHandler("bookmarks:getById", (event, id) => {
    if (!id) throw new Error("ID do bookmark não fornecido");
    return getBookmarkById(id);
  }));
  ipcMain.handle("bookmarks:delete", createErrorHandler("bookmarks:delete", (event, id) => {
    if (!id) throw new Error("ID do bookmark não fornecido");
    return deleteBookmark(id);
  }));
  ipcMain.handle("tags:getAll", createErrorHandler("tags:getAll", (event) => {
    return getAllTags();
  }));
  ipcMain.handle("tags:create", createErrorHandler("tags:create", (event, { name, color }) => {
    if (!name || !name.trim()) throw new Error("Nome da tag é obrigatório");
    return createTag(name, color);
  }));
  ipcMain.handle("tags:update", createErrorHandler("tags:update", (event, { id, name, color }) => {
    if (!id) throw new Error("ID da tag não fornecido");
    if (!name || !name.trim()) throw new Error("Nome da tag é obrigatório");
    return updateTag(id, { name, color });
  }));
  ipcMain.handle("tags:delete", createErrorHandler("tags:delete", (event, id) => {
    if (!id) throw new Error("ID da tag não fornecido");
    return deleteTag(id);
  }));
  ipcMain.handle("bookmarkTags:get", createErrorHandler("bookmarkTags:get", (event, bookmarkId) => {
    if (!bookmarkId) throw new Error("ID do bookmark não fornecido");
    return getBookmarkTags(bookmarkId);
  }));
  ipcMain.handle("bookmarkTags:set", createErrorHandler("bookmarkTags:set", (event, { bookmarkId, tagIds }) => {
    if (!bookmarkId) throw new Error("ID do bookmark não fornecido");
    if (!Array.isArray(tagIds)) throw new Error("IDs das tags devem ser um array");
    return setBookmarkTags(bookmarkId, tagIds);
  }));
  ipcMain.handle("notes:get", createErrorHandler("notes:get", (event, bookmarkId) => {
    if (!bookmarkId) throw new Error("ID do bookmark não fornecido");
    return getNote(bookmarkId);
  }));
  ipcMain.handle("notes:upsert", createErrorHandler("notes:upsert", (event, { bookmarkId, content }) => {
    if (!bookmarkId) throw new Error("ID do bookmark não fornecido");
    if (typeof content !== "string") throw new Error("Conteúdo da nota deve ser uma string");
    return upsertNote(bookmarkId, content);
  }));
  ipcMain.handle("notes:delete", createErrorHandler("notes:delete", (event, bookmarkId) => {
    if (!bookmarkId) throw new Error("ID do bookmark não fornecido");
    return deleteNote(bookmarkId);
  }));
  ipcMain.handle("import:run", createErrorHandler("import:run", async (event) => {
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
      console.error("[Import Error]:", error);
      return { success: false, message: `Erro na importação: ${error.message}` };
    }
  }));
  ipcMain.handle("app:getStats", createErrorHandler("app:getStats", (event) => {
    return getStats();
  }));
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
