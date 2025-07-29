export function saveChats(model, messages) {
  localStorage.setItem(`chat_${model}`, JSON.stringify(messages));
}

export function loadChats(model) {
  const raw = localStorage.getItem(`chat_${model}`);
  return raw ? JSON.parse(raw) : [];
}
