const queues = new Map();

export function getQueue(chatId) {
  if (!queues.has(chatId)) queues.set(chatId, []);
  return queues.get(chatId);
}

export function enqueue(chatId, track) {
  const queue = getQueue(chatId);
  queue.push(track);
  return queue;
}

export function dequeue(chatId) {
  const queue = getQueue(chatId);
  return queue.shift() || null;
}

export function clearQueue(chatId) {
  queues.delete(chatId);
}

export function queueSnapshot(chatId) {
  return [...getQueue(chatId)];
}
