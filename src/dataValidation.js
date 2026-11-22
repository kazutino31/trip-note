const currencies = ["EUR", "CZK", "HUF", "TWD"];

export const validRate = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
export const validBudget = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

function normalizeNumber(value, valid) {
  if (
    typeof value !== "number" &&
    (typeof value !== "string" || !value.trim())
  ) {
    throw new Error("invalid-number");
  }
  const number = Number(value);
  if (!valid(number)) throw new Error("invalid-number");
  return number;
}

export const normalizeRate = (value) => normalizeNumber(value, validRate);
export const normalizeBudget = (value) => normalizeNumber(value, validBudget);

function normalizeItems(value, normalizeItem) {
  if (!Array.isArray(value)) throw new Error("invalid-list");
  const ids = new Set();
  const prefix = `restored-${Date.now()}-`;
  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("invalid-item");
    }
    const id = item.id ?? `${prefix}${index}`;
    if (
      (typeof id !== "string" && typeof id !== "number") ||
      (typeof id === "string" && !id.trim()) ||
      (typeof id === "number" && !Number.isFinite(id)) ||
      ids.has(id)
    ) {
      throw new Error("invalid-id");
    }
    ids.add(id);
    return { ...normalizeItem(item), id };
  });
}

export function normalizeExpenses(value) {
  return normalizeItems(value, (item) => {
    if (
      typeof item.description !== "string" ||
      !currencies.includes(item.currency)
    ) {
      throw new Error("invalid-expense");
    }
    return {
      date: String(item.date || ""),
      category: String(item.category || "其他"),
      description: item.description,
      currency: item.currency,
      amount: normalizeBudget(item.amount),
      payer: String(item.payer || "共同"),
    };
  });
}

export function normalizeChecklist(value) {
  return normalizeItems(value, (item) => {
    if (
      typeof item.text !== "string" ||
      (item.done !== undefined && typeof item.done !== "boolean")
    ) {
      throw new Error("invalid-checklist-item");
    }
    return { text: item.text, done: item.done ?? false };
  });
}

export function normalizeBackup(backup) {
  const data = backup?.data;
  if (backup?.schemaVersion !== 1 || !data) throw new Error("invalid-format");
  return {
    rate: normalizeRate(data.rate),
    czkRate: data.czkRate === undefined ? 1.4 : normalizeRate(data.czkRate),
    hufRate: data.hufRate === undefined ? 0.09 : normalizeRate(data.hufRate),
    budget: normalizeBudget(data.budget),
    expenses: normalizeExpenses(data.expenses),
    checklist: normalizeChecklist(data.checklist),
  };
}
