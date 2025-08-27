const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

// === KONFIGURATION ===
const token = "MTQxMDI4NTMyODA2OTI5NjIyOQ.Gsb1Gc.Wc3aczISFLv6BnDgi16qowSHARP2hFBnOcKUqg"; // Deinen Bot-Token eintragen
const channelId = "1410286711681843380";   // ID vom Discord Channel eintragen
const serverIp = "5.175.192.45:30120";  // IP:Port von deinem FiveM-Server

// =====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

async function getPlayerCount() {
  try {
    const infoResponse = await fetch(`http://${serverIp}/info.json`);
    const info = await infoResponse.json();

    const playersResponse = await fetch(`http://${serverIp}/players.json`);
    const players = await playersResponse.json();

    return {
      clients: players.length,
      maxClients: info.vars.sv_maxClients
    };
  } catch (err) {
    console.error("❌ Fehler beim Abrufen:", err.message);
    return null;
  }
}

async function updateChannelName() {
  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    console.error("❌ Channel nicht gefunden!");
    return;
  }

  const data = await getPlayerCount();
  if (!data) {
    await channel.setName("Spieler » Offline").catch(console.error);
    return;
  }

  const newName = `Spieler » ${data.clients}/${data.maxClients}`;
  await channel.setName(newName).catch(console.error);

  console.log(`✅ Channel aktualisiert: ${newName}`);
}

client.once("ready", () => {
  console.log(`🤖 Eingeloggt als ${client.user.tag}`);

  // alle 60 Sekunden updaten
  updateChannelName();
  setInterval(updateChannelName, 60 * 1000);
});

client.login(token);
