// Feature 7: Community Theme Marketplace
// Manage theme registry and installation

const fs = require('fs');
const path = require('path');
const os = require('os');

const THEMES_DIR = path.join(os.homedir(), '.slidedown', 'themes');

function ensureThemesDir() {
  if (!fs.existsSync(THEMES_DIR)) {
    fs.mkdirSync(THEMES_DIR, { recursive: true });
  }
}

function listThemes() {
  ensureThemesDir();
  const themes = fs.readdirSync(THEMES_DIR);
  return themes;
}

function installTheme(themeName, themeData) {
  ensureThemesDir();
  const themeFile = path.join(THEMES_DIR, `${themeName}.json`);
  fs.writeFileSync(themeFile, JSON.stringify(themeData, null, 2));
  console.log(`✅ Theme installed: ${themeName}`);
}

function getTheme(themeName) {
  const themeFile = path.join(THEMES_DIR, `${themeName}.json`);
  if (fs.existsSync(themeFile)) {
    return JSON.parse(fs.readFileSync(themeFile, 'utf-8'));
  }
  return null;
}

function removeTheme(themeName) {
  const themeFile = path.join(THEMES_DIR, `${themeName}.json`);
  if (fs.existsSync(themeFile)) {
    fs.unlinkSync(themeFile);
    console.log(`✅ Theme removed: ${themeName}`);
  }
}

module.exports = {
  listThemes,
  installTheme,
  getTheme,
  removeTheme,
  THEMES_DIR
};
