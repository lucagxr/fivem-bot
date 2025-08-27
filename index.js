const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

// === KONFIGURATION ===
const CHANNEL_ID = "1410286711681843380";   // <-- deine Discord Channel-ID
const SERVER_IP = "5.175.192.45:30120";       // <-- deine FiveM Server-IP:Port

// === DISCORD CLIENT ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// === TOKEN EINLESEN + DEBUG ===
const TOKEN = process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.trim() : null;

if (!TOKEN) {
  console.error("❌ Kein Token gefunden! Bitte Railway-Variable DISCORD_TOKEN prüfen.");
  process.exit(1);
}

// Debug-Ausgabe: Länge + erste/letzte 4 Zeichen (zeigt NICHT den ganzen Token!)
console.log("🔑 Token-Check:");
console.log("   Länge:", TOKEN.length);
console.log("   Start:", TOKEN.substring(0, 4));
console.log("   Ende :", TOKEN.substring(TOKEN.length - 4));

// === FUNKTION SPIELER ABRUFEN ===
async function getPlayerCount() {
  try {
    const infoResponse = await fetch(`http://${SERVER_IP}/info.json`);
    const info = await infoResponse.json();

    const playersResponse = await fetch(`http://${SERVER_IP}/players.json`);
    const players = await playersResponse.json();

    return `${players.length}/${info.vars.sv_maxClients}`;
  } catch (err) {
    console.error("❌ Fehler beim Abrufen:", err.message);
    return null;
  }
}

// === FUNKTION CHANNEL UPDATEN ===
async function updateChannelName() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.error("❌ Channel nicht gefunden!");
      return;
    }

    const count = await getPlayerCount();
    const newName = count ? `Spieler » ${count}` : "Spieler » Offline";

    await channel.setName(newName);
    console.log(`✅ Channel aktualisiert: ${newName}`);
  } catch (err) {
    console.error("❌ Konnte Channel nicht ändern:", err);
  }
}

// === EVENT: BOT BEREIT ===
client.once("ready", () => {
  console.log(`🤖 Eingeloggt als ${client.user.tag}`);
  updateChannelName();
  setInterval(updateChannelName, 60 * 1000); // alle 60 Sekunden
});

// === LOGIN ===
console.log("🔑 Versuche Login...");
client.login(TOKEN);
