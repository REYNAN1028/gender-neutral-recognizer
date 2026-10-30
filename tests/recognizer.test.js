"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { TERM_DICTIONARY, analyzeText } = require("../recognizer.js");

const find = (analysis, term) => analysis.results.find((r) => r.term === term);

test("dictionary has the 15 required entries", () => {
  assert.equal(TERM_DICTIONARY.length, 15);
});

test("every dictionary term is recognized with its correct alternative", () => {
  for (const { term, alternative } of TERM_DICTIONARY) {
    const a = analyzeText(`The ${term} arrived.`);
    assert.equal(a.distinctTerms, 1, term);
    assert.equal(a.totalOccurrences, 1, term);
    assert.equal(a.results[0].term, term);
    assert.equal(a.results[0].alternative, alternative);
    assert.equal(a.results[0].count, 1);
  }
});

test("matching is case-insensitive", () => {
  const a = analyzeText("Chairman CHAIRMAN chairman ChAiRmAn");
  assert.equal(find(a, "chairman").count, 4);
});

test("whole-word matching: no substring false positives", () => {
  const a = analyzeText("The therapist said there is a stewardship program and chairmanship rules.");
  assert.equal(a.totalOccurrences, 0);
  assert.equal(analyzeText("the there then them").totalOccurrences, 0);
});

test("repeated occurrences are counted accurately", () => {
  const a = analyzeText("fireman, fireman. Fireman! (fireman)");
  assert.equal(find(a, "fireman").count, 4);
});

test("punctuation and surrounding whitespace are handled", () => {
  const a = analyzeText("\"policeman\"; (mailman)\nsalesman,\tmankind's end-of-line manpower.");
  assert.equal(a.distinctTerms, 5);
  assert.equal(a.totalOccurrences, 5);
});

test("multiword phrases work with flexible whitespace", () => {
  const dict = [{ term: "police officer chief", alternative: "x" }];
  assert.equal(analyzeText("The Police   Officer\nChief spoke.", dict).totalOccurrences, 1);
});

test("overlap: stewardess is not also counted as steward", () => {
  const a = analyzeText("A stewardess helped.");
  assert.equal(a.distinctTerms, 1);
  assert.equal(find(a, "stewardess").count, 1);
  assert.equal(find(a, "steward"), undefined);
});

test("overlap: chairwoman/businesswoman are not counted as shorter terms", () => {
  const a = analyzeText("chairwoman businesswoman congresswoman policewoman");
  assert.equal(a.totalOccurrences, 4);
  assert.equal(a.distinctTerms, 4);
});

test("steward and stewardess in the same text are counted separately", () => {
  const a = analyzeText("steward stewardess steward");
  assert.equal(find(a, "steward").count, 2);
  assert.equal(find(a, "stewardess").count, 1);
});

test("empty and non-string input returns empty analysis", () => {
  const empty = { results: [], distinctTerms: 0, totalOccurrences: 0 };
  assert.deepEqual(analyzeText(""), empty);
  assert.deepEqual(analyzeText(null), empty);
  assert.deepEqual(analyzeText(undefined), empty);
});

test("text without predefined terms returns no results", () => {
  const a = analyzeText("He and she went to the market, and there they met the others.");
  assert.equal(a.results.length, 0);
  assert.equal(a.totalOccurrences, 0);
});

test("distinct terms and total occurrences are calculated correctly", () => {
  const a = analyzeText("chairman chairman mailman");
  assert.equal(a.distinctTerms, 2);
  assert.equal(a.totalOccurrences, 3);
});

test("zero-count terms are not returned", () => {
  const a = analyzeText("mailman");
  assert.equal(a.results.length, 1);
});

test("original text is not modified", () => {
  const text = "The Chairman spoke.";
  analyzeText(text);
  assert.equal(text, "The Chairman spoke.");
});

test("sample_with_terms.txt gives 15 distinct terms and 17 occurrences", () => {
  const text = fs.readFileSync(path.join(__dirname, "..", "samples", "sample_with_terms.txt"), "utf8");
  const a = analyzeText(text);
  assert.equal(a.distinctTerms, 15);
  assert.equal(a.totalOccurrences, 17);
  assert.equal(find(a, "chairman").count, 2);
  assert.equal(find(a, "mankind").count, 2);
  assert.equal(find(a, "steward").count, 1);
});

test("sample_no_terms.txt gives no matches", () => {
  const text = fs.readFileSync(path.join(__dirname, "..", "samples", "sample_no_terms.txt"), "utf8");
  assert.equal(analyzeText(text).totalOccurrences, 0);
});
