import { Dna, Atom, FlaskConical, Calculator, BookOpen } from "lucide-react";

// Maps a subject string (e.g. "Biology XI", "Chemistry", "Physics XII") to a
// consistent icon + color pairing used across Flashcards, Progress, Analytics, etc.
const SUBJECT_STYLES = [
  { match: /bio/i,   icon: Dna,          color: "#1e8449", bg: "#d5f5e3" },
  { match: /phys/i,  icon: Atom,         color: "#1a5276", bg: "#d6eaf8" },
  { match: /chem/i,  icon: FlaskConical, color: "#7d3c98", bg: "#e8daef" },
  { match: /math/i,  icon: Calculator,   color: "#c9922a", bg: "#fdebd0" },
];

export function subjectStyle(subject = "") {
  const found = SUBJECT_STYLES.find((s) => s.match.test(subject));
  return found || { icon: BookOpen, color: "#c0392b", bg: "#fadbd8" };
}

export function fmtDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return String(value);
  }
}
