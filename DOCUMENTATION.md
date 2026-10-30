Republic of the Philippines
**BOHOL ISLAND STATE UNIVERSITY**
Cogtong, Candijay, 6312, Bohol, Philippines
Office of the College of Sciences

**PROJECT IN AUTOMATA AND LANGUAGE THEORY**

**GENDER NEUTRAL LANGUAGE RECOGNIZER**

**Submitted by:** [Insert actual student or group member names]

**BSCS 3A**

**Submitted to:** ALMA MAE B. AUXTERO, Instructor

**Date submitted:** [Insert actual date]

---

## 1  Project overview

The Gender Neutral Language Recognizer is a browser-based application that reads a `.txt`, `.pdf`, or `.docx` file, uses JavaScript regular expressions to find 15 predefined gender-specific words, counts how often each appears, and displays the results in a table with a suggested gender-neutral alternative. Matching ignores capitalization and accepts whole words only, longer terms take priority over shorter overlapping ones, and clear messages are shown for empty files, unsupported formats, read errors, and documents with no matches. Suggestions are for human review; the original file is never modified.

## 2  Tools and recognition approach

**Tools.** HTML5 provides the page structure, CSS3 the responsive styling, and vanilla JavaScript the file reading (File API / `FileReader`) and format handling, recognition (`RegExp`), counting, and rendering. Text is extracted from `.pdf` files with PDF.js and from `.docx` files with mammoth.js (both run in the browser; `.txt` is read natively). These libraries only produce plain text; recognition is done by our own regular-expression code. Node.js's built-in test runner is used only for unit tests. No frameworks, backend, or database are used.

**Approach: regular expressions.** Regular expressions were chosen because the terms are a finite set of fixed words, which is a regular language, and JavaScript's `RegExp` engine can recognize it directly (internally comparable to a finite automaton). The recognition code is in `recognizer.js`, separate from the interface code in `script.js`.

**Actual pattern.** `buildPattern()` joins all dictionary terms, sorted longest first, into one alternation wrapped in boundary checks:

```
(?<![\p{L}\p{N}_])(chairwoman|congresswoman|businesswoman|... |steward|...)(?![\p{L}\p{N}_])
```

with flags `g` (global), `i` (case-insensitive), and `u` (Unicode, needed for `\p{...}`).

- **Case-insensitive:** the `i` flag makes `Chairman`, `CHAIRMAN`, and `chairman` match.
- **Whole word:** `(?<![\p{L}\p{N}_])` (not preceded by a letter, digit, or underscore) and `(?![\p{L}\p{N}_])` (not followed by one) replace the simpler `\b`, which only understands ASCII word characters. So `there` cannot trigger `he`, and `stewardship` cannot trigger `steward`. Punctuation and whitespace count as boundaries, so `"mailman,"` and `(fireman)` match.
- **Phrases:** `phraseToPattern()` joins the words of a multiword term with `\s+`, so any spacing or line break between words matches. The current dictionary has only single words; this support is covered by a unit test.
- **Counting:** `text.matchAll(pattern)` yields every match; each is lowercased and tallied in a `Map`. Only terms with a count above zero are returned as `{ term, alternative, count }`, plus `distinctTerms` and `totalOccurrences`.
- **Overlap handling:** the alternation is tried left to right and terms are sorted longest first, so `stewardess` is tried before `steward`. The scan continues after each match, so no characters are matched twice, and the boundary rule would also reject `steward` inside `stewardess`. Policy: *longest match wins, each text occurrence counted once.*

**Term dictionary** (`TERM_DICTIONARY` in `recognizer.js`):

| Term | Suggested alternative |
|------|-----------------------|
| chairman | chairperson |
| chairwoman | chairperson |
| policeman | police officer |
| policewoman | police officer |
| fireman | firefighter |
| stewardess | flight attendant |
| steward | flight attendant |
| mankind | humankind |
| manpower | workforce |
| businessman | businessperson |
| businesswoman | businessperson |
| mailman | mail carrier |
| congressman | member of Congress |
| congresswoman | member of Congress |
| salesman | salesperson |

**Limitations.** Only these 15 terms are recognized; other biased wording and inflected forms (for example `chairmen`) are not. Alternatives depend on context. Extension checking cannot verify real file content. Scanned (image-only) and password-protected PDFs, and legacy `.doc` files, are not supported; text extraction from PDFs can split or miss words depending on the document's layout. User text is displayed only through `textContent`, never `innerHTML`.

## 3  Application screenshots

[Screenshot 1: insert `screenshots/screenshot-1-main-interface.png`]
*Figure 1. Main interface with a `.txt` file selected.*

[Screenshot 2: insert `screenshots/screenshot-2-results-table.png`]
*Figure 2. Results table showing recognized terms, occurrence counts, and suggested alternatives.*

[Screenshot 3: insert `screenshots/screenshot-3-no-terms.png`]
*Figure 3. Message shown when no predefined terms are detected.*

**Source code:** [Insert the publicly accessible GitHub repository URL here]

## 4  Testing

Automated unit tests (`npm test`) were run on the recognition function: 17 tests, 17 passed, 0 failed (Node.js v22). The five instructor-required browser tests below must be performed by the group; the actual results and statuses must be recorded after testing (details in `tests/manual-test-results.md`).

| ID | Situation | Expected result | Actual result | Status |
|----|-----------|-----------------|---------------|--------|
| T1 | Document with listed terms (`sample_with_terms.txt`) | 15 distinct terms, 17 total occurrences; table with counts and alternatives | [record after testing] | NOT RUN |
| T2 | Same term repeated, different capitalization (`Chairman chairman CHAIRMAN`) | 1 distinct term, 3 occurrences, chairperson | [record after testing] | NOT RUN |
| T3 | No listed terms, includes "the" (`sample_no_terms.txt`) | "No predefined gender-specific terms were detected."; "he" not detected | [record after testing] | NOT RUN |
| T4 | Empty `.txt` file | Message that the file is empty | [record after testing] | NOT RUN |
| T5 | Unsupported format (`.xlsx` or `.doc`) | Unsupported file format message (message lists .txt, .pdf, .docx) | [record after testing] | NOT RUN |

## 5  Conclusion

The project implements a client-side recognizer that detects 15 predefined gender-specific terms with regular expressions, counts occurrences, and presents suggested alternatives with validation messages for invalid input; its recognition function passed all 17 automated unit tests, which taught us how boundary checks, alternation order, and global matching affect correctness. The browser interface tests are still to be recorded [update this sentence after completing Section 4]. Known limitations are the small fixed dictionary, lack of context awareness, no inflected forms, and `.txt`-only support.

## 6  Sources and contributions

**Sources:** MDN Web Docs (Regular expressions; `RegExp`; `String.prototype.matchAll`; File API / `FileReader`); PDF.js documentation; mammoth.js documentation; Node.js documentation (`node:test`). **AI assistance:** Claude (Anthropic) was used to draft the source code, tests, and documentation; the group reviewed and ran them. [Edit this statement to reflect your actual use.]

| Group member | Assigned tasks | Actual contribution |
|--------------|----------------|---------------------|
| [Name] | [e.g., recognition module] | [describe] |
| [Name] | [e.g., user interface] | [describe] |
| [Name] | [e.g., testing and documentation] | [describe] |
