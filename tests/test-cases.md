# Test Cases

## Unit tests vs. manual tests

- **Unit tests** (`tests/recognizer.test.js`) call the recognition function `analyzeText()` directly in Node.js with strings. They are fast, repeatable, and check the algorithm only (matching, counting, overlaps). They do not involve the browser, buttons, or file reading.
- **Manual tests** (`tests/manual-test-results.md`) exercise the complete browser application: choosing a file, validation messages, the summary, and the results table. A person performs them and records what actually happened.

## Automated tests (run with `npm test`)

| # | Test | Expected |
|---|------|----------|
| 1 | Dictionary size | 15 entries |
| 2 | Every dictionary term recognized | Each term found once, correct alternative |
| 3 | Case-insensitive | `Chairman CHAIRMAN chairman ChAiRmAn` -> 4 |
| 4 | Whole-word | `the`, `there`, `therapist`, `stewardship`, `chairmanship` -> 0 matches |
| 5 | Repeated occurrences | 4 occurrences of `fireman` counted |
| 6 | Punctuation / whitespace | quotes, parentheses, commas, tabs, newlines, `mankind's` handled |
| 7 | Multiword phrases | Phrase with irregular whitespace matched once |
| 8 | Overlap: stewardess vs steward | Only `stewardess` counted |
| 9 | Overlap: *-woman terms | Not counted as shorter terms |
| 10 | steward + stewardess together | steward = 2, stewardess = 1 |
| 11 | Empty / null / undefined input | Empty analysis object |
| 12 | Text without terms | No results |
| 13 | Distinct vs. total | `chairman chairman mailman` -> 2 distinct, 3 total |
| 14 | Zero-count terms | Not returned |
| 15 | Original text preserved | Input string unchanged |
| 16 | `samples/sample_with_terms.txt` | 15 distinct terms, 17 total occurrences |
| 17 | `samples/sample_no_terms.txt` | 0 matches |

## Expected output of `samples/sample_with_terms.txt`

| Term | Count | Alternative |
|------|-------|-------------|
| chairman | 2 | chairperson |
| chairwoman | 1 | chairperson |
| policeman | 1 | police officer |
| policewoman | 1 | police officer |
| fireman | 1 | firefighter |
| stewardess | 1 | flight attendant |
| steward | 1 | flight attendant |
| mankind | 2 | humankind |
| manpower | 1 | workforce |
| businessman | 1 | businessperson |
| businesswoman | 1 | businessperson |
| mailman | 1 | mail carrier |
| congressman | 1 | member of Congress |
| congresswoman | 1 | member of Congress |
| salesman | 1 | salesperson |

Summary: 15 distinct terms, 17 total occurrences. The sample also contains `the`, `there`, `he`, and `she`, which must not be reported. (Confirmed by unit test 16; browser display still needs a manual run.)

## Expected output of `samples/sample_no_terms.txt`

Message shown: `No predefined gender-specific terms were detected.` with a summary of 0 distinct terms and 0 occurrences and no results table.

## Manual browser tests

Supported formats are `.txt`, `.pdf`, and `.docx`. The unit tests cover only the recognition function; PDF/Word text extraction is covered by manual tests P1-P6.

See `tests/manual-test-results.md`.
