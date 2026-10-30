# Gender Neutral Language Recognizer

A browser-based tool for the course *Automata and Language Theory* (BSCS 3A). It reads a `.txt`, `.pdf`, or `.docx` file, finds predefined gender-specific words using **JavaScript regular expressions**, counts them, and suggests gender-neutral alternatives for human review. It never changes your file.

## Features

- Upload or drag-and-drop a `.txt`, `.pdf`, or `.docx` file
- 15 predefined terms with suggested alternatives
- Case-insensitive, whole-word matching (`he` is not found in `the`)
- Longest-match-first rule (`stewardess` is not also counted as `steward`)
- Summary of distinct terms vs. total occurrences
- Results table: No., term, occurrences, alternative
- Clear messages for: no file, empty file, unsupported format (anything other than `.txt`, `.pdf`, `.docx`), read errors, no readable text, no matches
- Runs entirely in the browser; nothing is uploaded or stored

## Technologies

HTML5, CSS3, vanilla JavaScript (`RegExp`, File API). Two small client-side libraries read the document formats: **PDF.js** (Mozilla, Apache-2.0) for `.pdf` and **mammoth.js** (BSD-2-Clause) for `.docx`. They only extract text; all recognition is still our own regex code. Node.js built-in test runner for unit tests only. No frameworks, database, or backend.

## Project structure

```
gender-neutral-recognizer/
    index.html            page structure
    styles.css            styling
    recognizer.js         dictionary + regex recognition (no DOM; shared by browser and Node)
    script.js             file handling, rendering, UI events
    package.json          test script
    lib/                  pdf.min.js, pdf.worker.min.js, mammoth.browser.min.js (you add these; see below)
    README.md
    DOCUMENTATION.md      academic report
    DEFENSE_GUIDE.md      demo script, Q&A, GitHub guide, checklist
    samples/
        sample_with_terms.txt
        sample_no_terms.txt
    tests/
        recognizer.test.js
        test-cases.md
        manual-test-results.md
    screenshots/
        README.md
```

`recognizer.js` was added (beyond the template structure) so the same recognition code can be tested in Node.js and used in the browser.

## Prerequisites

- A modern browser (Chrome, Edge, Firefox, Safari) to run the app.
- Node.js 18 or newer **only** if you want to run the automated tests. Check with:

```bash
node --version
```

Install Node.js from https://nodejs.org if the command is not found. No `npm install` is needed because there are no dependencies.

## PDF and Word support (one-time setup)

`.txt` works with no setup. To read `.pdf` and `.docx`, download three files once and put them in the `lib/` folder (the filenames must match exactly):

| Save as | Download from |
|---|---|
| `lib/pdf.min.js` | https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js |
| `lib/pdf.worker.min.js` | https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js |
| `lib/mammoth.browser.min.js` | https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js |

Open each link in your browser, then Save As (Ctrl+S) into `lib/`. Or, from the project folder: `curl -L -o lib/pdf.min.js <url>` for each. Commit the `lib/` folder to GitHub so the app works for others. If a file is missing, the app shows a message and only that format is unavailable.

Scanned PDFs (images of text) have no text layer and cannot be read; the app reports "No readable text was found".

## Run the application

Simplest: double-click `index.html` to open it in your browser.

Optional (development convenience only, not a backend):

```bash
npm start
```

then open http://localhost:8080 (this downloads the `http-server` helper through `npx` on first use). Alternatively: `python3 -m http.server 8080`.

## Run the automated tests

```bash
npm test
```

(Equivalent: `node --test tests/recognizer.test.js`.) Expected: 17 tests, 17 pass, 0 fail.

## Use the sample files

1. Open the app, choose `samples/sample_with_terms.txt`, click **Analyze Document**. Expect 15 distinct terms and 17 total occurrences (chairman = 2, mankind = 2, all others 1).
2. Choose `samples/sample_no_terms.txt` and analyze. Expect: `No predefined gender-specific terms were detected.`

The browser behavior must still be confirmed by you; see `tests/manual-test-results.md`.

## Known limitations

- Only the 15 dictionary terms are recognized; many other gender-biased expressions are not.
- Suggestions depend on context and must be reviewed by a person.
- Only whole words: `chairmen`, `policemen`, hyphenated or compound variants are not in the dictionary.
- Extension checking cannot prove a file's real type; a renamed file is reported as unreadable.
- `.pdf` and `.docx` text extraction depends on PDF.js and mammoth.js; scanned/image-only PDFs, password-protected PDFs, and old `.doc` files are not supported. Text in headers, footers, text boxes, or odd PDF layouts may be missed or split.
- Whole-word rule treats letters, digits, and `_` as word characters; `mankind's` still matches because `'` is not one.

## Publish to GitHub

See `DEFENSE_GUIDE.md`, section "GitHub submission guide".

## Credits and references

- MDN Web Docs: Regular expressions, `RegExp`, File API, `FileReader`
- PDF.js: https://mozilla.github.io/pdf.js/
- mammoth.js: https://github.com/mwilliamson/mammoth.js
- Node.js documentation: test runner
- Code and documentation drafted with AI assistance (Claude); reviewed and tested by the student(s).
