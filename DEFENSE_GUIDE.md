# Defense Guide

## Architecture in brief

- `recognizer.js`: dictionary + `analyzeText(text)`; no DOM; works in Node and browser.
- `script.js`: validates the file type, reads it with `FileReader` (and PDF.js / mammoth.js to extract text from `.pdf` / `.docx`), calls `Recognizer.analyzeText`, renders with `textContent`.
- `index.html` / `styles.css`: interface.

## Short presentation script (about 3 minutes)

1. "Our project detects gender-specific words in a text file and suggests neutral alternatives, using regular expressions."
2. Show the page: header, file chooser, Analyze and Clear buttons.
3. Choose `sample_with_terms.txt`, click Analyze. "The summary separates distinct terms (15) from total occurrences (17). The table shows each term, its count, and the suggestion."
4. Open `recognizer.js`: show `TERM_DICTIONARY`, then `buildPattern`. Explain flags `g`, `i`, `u`, the lookbehind/lookahead boundaries, and the longest-first order.
5. (If libraries are installed) analyze `test-inputs/P1_sample.pdf` and `P1_sample.docx` to show the same recognizer works on other formats.
5. Point out that `the`, `there`, `he`, `she` in the sample are not reported.
6. Analyze `sample_no_terms.txt`: exact no-match message.
7. Choose an empty `.txt` and a `.pdf`: show the different messages.
8. Mention limits: fixed dictionary, context-dependent suggestions, `.txt` only.

## How each topic works

- **File reading:** `<input type="file">` gives a `File`; we check the extension (`.txt`, `.pdf`, `.docx`) and size. `.txt` uses `FileReader.readAsText`; `.pdf` uses PDF.js to read the text of each page; `.docx` uses mammoth.js `extractRawText`. All three produce a plain string that goes to the same `analyzeText` function.
- **Dictionary:** an array of `{ term, alternative }` objects, separate from the algorithm.
- **Regex recognition:** all terms are combined into one alternation and scanned with `matchAll`.
- **Capitalization:** the `i` flag.
- **Whole words:** lookbehind `(?<![\p{L}\p{N}_])` and lookahead `(?![\p{L}\p{N}_])`.
- **Counting:** each match is lowercased and added to a `Map`.
- **Overlaps:** longest term first; scan never re-reads matched characters.
- **No matches:** analysis succeeds with 0 results, so the exact message is shown.
- **Empty / unsupported:** size 0 -> empty message; wrong extension -> unsupported message; PDF/Word with no text (e.g. scanned) -> no-readable-text message; these checks happen before reading.
- **Regex vs. FSA:** a regular expression is a *description* of a regular language; a finite state automaton is a *machine* (states and transitions) that recognizes it. They are equivalent in power; the regex engine compiles our pattern into something that does the matching. We did not hand-build a DFA.

## Likely instructor questions

1. **Why regex instead of an FSA?** The terms are a finite set of fixed words (a regular language). Regex expresses it concisely and the engine does the matching; it is allowed by the guide.
2. **Are regexes and finite automata related?** Yes. Every regular expression (in the formal sense) has an equivalent NFA/DFA and vice versa (Kleene's theorem). Our pattern uses lookarounds, which JavaScript supports as extensions beyond formal regular expressions, so say that honestly.
3. **Why not `\b`?** `\b` only treats ASCII letters, digits, and `_` as word characters, so it handles accented letters poorly. Our lookarounds with `\p{L}\p{N}` cover Unicode letters and digits.
4. **How is `he` prevented from matching in `the`?** `he` is not in our dictionary, but the same rule applies to any term: a match cannot be preceded or followed by a letter, so `stewardship` does not match `steward`.
5. **How do you avoid counting `steward` inside `stewardess`?** Terms are sorted longest first, so `stewardess` matches first; the boundary rule also rejects `steward` followed by `ess`.
6. **What does the `g` flag do?** Finds all matches instead of stopping at the first.
7. **What does `i` do? `u`?** `i` ignores case; `u` enables Unicode mode, required for `\p{L}`.
8. **Why separate `recognizer.js` from `script.js`?** So the logic can be unit-tested in Node without a browser, and the UI never duplicates recognition logic.
9. **How do you handle security?** Content is shown with `textContent`, never `innerHTML`; nothing is uploaded or stored.
10. **Can extension validation prove a file is text?** No; a renamed file would pass. The app is meant for ordinary plain-text documents.
11. **What are the limitations?** Fixed 15-term dictionary, no inflections (`chairmen`), no context awareness, `.txt` only.
12. **Future improvements:** larger or editable dictionary, plural forms, OCR for scanned PDFs, legacy `.doc` support, highlighting terms in the text, export results.
13. **Why libraries for PDF/Word?** Those are binary formats (a PDF has compressed streams; a `.docx` is a zip of XML), so we use PDF.js and mammoth.js only to get plain text. The regex recognition is still our own code.

## GitHub submission guide

1. Create an account at https://github.com if needed.
2. Click **New repository**; name it `gender-neutral-recognizer`; choose **Public**; create it.
3. Upload the project: on the repository page choose **Add file -> Upload files**, drag the contents of the project folder (keep `samples/`, `tests/`, `screenshots/` folders), and **Commit changes**. Or with Git:
   ```bash
   git init
   git add .
   git commit -m "Gender Neutral Language Recognizer"
   git branch -M main
   git remote add origin https://github.com/<your-username>/gender-neutral-recognizer.git
   git push -u origin main
   ```
4. Check that these are present: `index.html`, `styles.css`, `recognizer.js`, `script.js`, `lib/` (three .js files), `package.json`, `README.md`, `DOCUMENTATION.md`, `samples/sample_with_terms.txt`, `samples/sample_no_terms.txt`, `tests/`.
5. Add your real screenshots to `screenshots/` (upload them the same way) and insert them into your document.
6. Update `README.md` if you want (names, link) and commit.
7. Copy the repository URL from your browser's address bar into Section 3 of the document.
8. Test it: open the link in a private/incognito window. If you can see the files without logging in, it is public.

## Final compliance checklist

- [ ] Opens and analyzes `.txt`, `.pdf`, and `.docx` files in the browser (`lib/` files in place)
- [ ] At least 10 terms with alternatives (15 implemented)
- [ ] Case-insensitive, whole-word matching
- [ ] Table shows terms, counts, alternatives
- [ ] Exact no-match message
- [ ] Empty file and unsupported format messages
- [ ] Automated tests run: `npm test`
- [ ] Five manual tests performed and recorded (replace NOT RUN)
- [ ] Three real screenshots added
- [ ] Group names, date, contributions filled in
- [ ] AI-assistance statement edited to be truthful
- [ ] Public GitHub link works
- [ ] You can explain the regex pattern and demo the app
