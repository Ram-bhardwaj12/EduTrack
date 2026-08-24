const clients = new Set();

function addClient(res) {
  clients.add(res);
}

function removeClient(res) {
  clients.delete(res);
}

function broadcastEvent(type, payload = {}) {
  const data = JSON.stringify({ type, payload, timestamp: Date.now() });
  for (const client of clients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      clients.delete(client);
    }
  }
}

module.exports = { addClient, removeClient, broadcastEvent };
