/**
 * recognizer.js
 * Pure recognition logic (no DOM). Works in the browser and in Node.js.
 *
 * Approach: JavaScript regular expressions.
 *  - One combined alternation pattern built from the dictionary.
 *  - Flags: g (global), i (case-insensitive).
 *  - Whole-word rule: a term must NOT be preceded or followed by a letter,
 *    digit, or underscore (see BOUNDARY_BEFORE / BOUNDARY_AFTER below).
 *  - Overlap policy: terms are sorted longest-first, and a regex alternation
 *    tries alternatives left-to-right, so "stewardess" is tried before
 *    "steward". The global scan also never rescans characters already
 *    matched, so one occurrence is counted exactly once.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Recognizer = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Dictionary: gender-specific term -> suggested neutral alternative. */
  const TERM_DICTIONARY = [
    { term: "chairman", alternative: "chairperson" },
    { term: "chairwoman", alternative: "chairperson" },
    { term: "policeman", alternative: "police officer" },
    { term: "policewoman", alternative: "police officer" },
    { term: "fireman", alternative: "firefighter" },
    { term: "stewardess", alternative: "flight attendant" },
    { term: "steward", alternative: "flight attendant" },
    { term: "mankind", alternative: "humankind" },
    { term: "manpower", alternative: "workforce" },
    { term: "businessman", alternative: "businessperson" },
    { term: "businesswoman", alternative: "businessperson" },
    { term: "mailman", alternative: "mail carrier" },
    { term: "congressman", alternative: "member of Congress" },
    { term: "congresswoman", alternative: "member of Congress" },
    { term: "salesman", alternative: "salesperson" },
  ];

  // Whole-word strategy: lookarounds instead of \b so that digits/underscores
  // and letters (including accented ones) next to the term block a match.
  const BOUNDARY_BEFORE = "(?<![\\p{L}\\p{N}_])";
  const BOUNDARY_AFTER = "(?![\\p{L}\\p{N}_])";

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /** Allow any run of whitespace between words of a multiword phrase. */
  function phraseToPattern(term) {
    return term.trim().split(/\s+/).map(escapeRegExp).join("\\s+");
  }

  /** Build the single combined regex from a dictionary (longest term first). */
  function buildPattern(dictionary) {
    const sorted = [...dictionary].sort((a, b) => b.term.length - a.term.length);
    const body = sorted.map((e) => phraseToPattern(e.term)).join("|");
    return new RegExp(BOUNDARY_BEFORE + "(" + body + ")" + BOUNDARY_AFTER, "giu");
  }

  /**
   * Analyze text and return structured results.
   * @returns {{results: Array<{term:string, alternative:string, count:number}>,
   *            distinctTerms:number, totalOccurrences:number}}
   */
  function analyzeText(text, dictionary = TERM_DICTIONARY) {
    const empty = { results: [], distinctTerms: 0, totalOccurrences: 0 };
    if (typeof text !== "string" || text.length === 0 || dictionary.length === 0) {
      return empty;
    }

    const lookup = new Map(
      dictionary.map((e) => [e.term.toLowerCase().split(/\s+/).join(" "), e])
    );
    const counts = new Map();
    const pattern = buildPattern(dictionary);

    for (const match of text.matchAll(pattern)) {
      const key = match[1].toLowerCase().split(/\s+/).join(" ");
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    // Keep dictionary order for stable, predictable output.
    const results = [];
    for (const entry of dictionary) {
      const key = entry.term.toLowerCase().split(/\s+/).join(" ");
      const count = counts.get(key);
      if (count) {
        results.push({ term: entry.term, alternative: lookup.get(key).alternative, count });
      }
    }

    return {
      results,
      distinctTerms: results.length,
      totalOccurrences: results.reduce((sum, r) => sum + r.count, 0),
    };
  }

  return { TERM_DICTIONARY, buildPattern, analyzeText };
});
