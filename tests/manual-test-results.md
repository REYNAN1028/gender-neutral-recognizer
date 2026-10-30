# Manual Browser Test Results

Perform each test in a browser, then replace `NOT RUN` with `PASS` or `FAIL` and fill in the **Actual result** column with what you really saw. Do not fill these in before running the test.

| Test ID | Description | Input | Expected result | Actual result | Status |
|---------|-------------|-------|-----------------|---------------|--------|
| T1 | Document with listed terms | `samples/sample_with_terms.txt` | Summary shows 15 distinct terms and 17 total occurrences. Table lists 15 rows with correct counts and alternatives (chairman = 2, mankind = 2). Success message shown. | _(record after testing)_ | NOT RUN |
| T2 | Same term repeated with different capitalization | Create `repeat.txt` containing: `Chairman chairman CHAIRMAN` | Summary: 1 distinct term, 3 total occurrences. One table row: chairman, 3, chairperson. | _(record after testing)_ | NOT RUN |
| T3 | Document with no listed terms (includes "the") | `samples/sample_no_terms.txt` | Message: `No predefined gender-specific terms were detected.` No results table. "he" is not detected. | _(record after testing)_ | NOT RUN |
| T4 | Empty `.txt` file | Zero-byte `empty.txt` | Message says the file is empty. No table. Different from the no-match message. | _(record after testing)_ | NOT RUN |
| T5 | Unsupported format | `test-inputs/T5_unsupported.xlsx` (also `.doc`) | Message says unsupported file format and lists .txt, .pdf, .docx. No table. | _(record after testing)_ | NOT RUN |

## PDF and Word tests (require the files in `lib/`)

| ID | Check | Input | Expected | Actual | Status |
|----|-------|-------|----------|--------|--------|
| P1a | PDF with terms (2 pages) | `test-inputs/P1_sample.pdf` | 8 distinct, 9 total; chairman = 2 (one on page 2); `stewardship` not counted | | NOT RUN |
| P1b | Word with terms (paragraphs + table) | `test-inputs/P1_sample.docx` | 9 distinct, 9 total; fireman and mailman (from the table) found; chairman = 1 | | NOT RUN |
| P2a | PDF without terms | `test-inputs/P2_no_terms.pdf` | "No predefined gender-specific terms were detected." | | NOT RUN |
| P2b | Word without terms | `test-inputs/P2_no_terms.docx` | Same message | | NOT RUN |
| P3a | PDF with no text | `test-inputs/P3_blank.pdf` | "No readable text was found in this document..." | | NOT RUN |
| P3b | Word with no text | `test-inputs/P3_blank.docx` | Same message | | NOT RUN |
| P4 | Corrupt PDF (text renamed `.pdf`) | `test-inputs/P4_corrupt.pdf` | "The file could not be read..." | | NOT RUN |
| P5 | Corrupt Word file | `test-inputs/P5_corrupt.docx` | "The file could not be read..." | | NOT RUN |
| P6 | Library missing (temporarily rename `lib/pdf.min.js`) | any `.pdf` | "PDF support is not available..." message | | NOT RUN |

## Extra checks (optional)

| ID | Check | Expected | Actual | Status |
|----|-------|----------|--------|--------|
| E1 | Click Analyze with no file chosen | "No file selected" message | | NOT RUN |
| E2 | Click Clear Results | Filename, summary, table, and message are cleared | | NOT RUN |
| E3 | Drag and drop a `.txt` file | Filename appears; Analyze works | | NOT RUN |
| E4 | Keyboard only (Tab / Enter) | Every control reachable with visible focus | | NOT RUN |
