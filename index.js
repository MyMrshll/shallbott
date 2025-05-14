const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const P = require("pino");
const qrCode = require("qrcode");
global.crypto = require("crypto");
const node_cache = require("node-cache");
const GroupCache = new node_cache({});
const { Boom } = require("@hapi/boom");
const { main } = require("./groq.js");
// const chalk = require("chalk");
const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: P({ level: "silent" }),
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
      ) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("Connected to WhatsApp!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith("@g.us"); // Cek apakah pesan dari grup
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text;


    if (!text) return;

    if (text.toLowerCase().includes("bot")) {
      
      if (isGroup) {
        const groupId = sender;
        const participant = msg.key.participant; // Nomor yang kirim pesan dalam grup
        console.log(`Pesan dari ${participant} di grup ${groupId}: ${text}`);
      }

      const response = await main(text);

      await sock.sendMessage(sender, { text: response });
    }
  });

};

connectToWhatsApp();
