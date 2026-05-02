import { Counter } from "../models/Counter.js";

export const generateId = async ({ type, prefix }) => {
  const seq = await Counter.getNextSequence(type);

  // ❗ safer check (>= not <)
  if (seq > 10000) {
    throw new Error("You have reached the maximum number of IDs.");
  }

  const year = new Date().getFullYear().toString().slice(-2);
  const padded = String(seq).padStart(4, "0");

  return `${prefix}-${year}-${padded}`;
};