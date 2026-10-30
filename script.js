/**
 * script.js
 * Browser interface: file validation, reading (File API), text extraction
 * (.txt natively, .pdf via PDF.js, .docx via mammoth.js), and rendering.
 * All recognition logic lives in recognizer.js (Recognizer.analyzeText).
 * User content is displayed only with textContent (never innerHTML).
 */
(function () {
  "use strict";

  const NO_MATCH_MESSAGE = "No predefined gender-specific terms were detected.";

  const fileInput = document.getElementById("file-input");
  const dropZone = document.getElementById("drop-zone");
  const selectedFileEl = document.getElementById("selected-file");
  const analyzeBtn = document.getElementById("analyze-btn");
  const clearBtn = document.getElementById("clear-btn");
  const statusEl = document.getElementById("status");
  const summarySection = document.getElementById("summary-section");
  const resultsSection = document.getElementById("results-section");
  const summaryDoc = document.getElementById("summary-doc");
  const summaryDistinct = document.getElementById("summary-distinct");
  const summaryTotal = document.getElementById("summary-total");
  const resultsBody = document.getElementById("results-body");

  let selectedFile = null;

  // Optional libraries, loaded from lib/ (see README). Needed only for .pdf / .docx.
  const PDF_WORKER_PATH = "lib/pdf.worker.min.js";

  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.className = "status" + (message ? " " + kind : "");
  }

  function hideResults() {
    summarySection.hidden = true;
    resultsSection.hidden = true;
    resultsBody.textContent = "";
  }

  /** Return "txt", "pdf", "docx", or null (unsupported) from the file extension. */
  function getFileType(file) {
    const match = /\.([^.]+)$/.exec(file.name);
    const ext = match ? match[1].toLowerCase() : "";
    return ext === "txt" || ext === "pdf" || ext === "docx" ? ext : null;
  }

  function selectFile(file) {
    hideResults();
    setStatus("", "");
    selectedFile = file || null;
    selectedFileEl.textContent = file ? file.name : "No file selected.";
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error || new Error("Read failed"));
      reader.readAsText(file);
    });
  }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Read failed"));
      reader.readAsArrayBuffer(file);
    });
  }

  /** Error with a user-facing message. */
  function userError(message) {
    const err = new Error(message);
    err.userMessage = message;
    return err;
  }

  async function extractPdfText(file) {
    if (typeof pdfjsLib === "undefined") {
      throw userError("PDF support is not available: lib/pdf.min.js was not found. See the README, section \"PDF and Word support\".");
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_PATH;
    const data = await readFileAsArrayBuffer(file);
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
    } catch (err) {
      if (err && err.name === "PasswordException") {
        throw userError("This PDF is password-protected and cannot be read.");
      }
      throw err;
    }
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str + (item.hasEOL ? "\n" : " ")).join(""));
    }
    return pages.join("\n");
  }

  async function extractDocxText(file) {
    if (typeof mammoth === "undefined") {
      throw userError("Word support is not available: lib/mammoth.browser.min.js was not found. See the README, section \"PDF and Word support\".");
    }
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  /** Read a supported file and return its plain text (never modifies the file). */
  function extractText(file, type) {
    if (type === "pdf") return extractPdfText(file);
    if (type === "docx") return extractDocxText(file);
    return readFileAsText(file);
  }

  function renderSummary(name, analysis) {
    summaryDoc.textContent = name;
    summaryDistinct.textContent = String(analysis.distinctTerms);
    summaryTotal.textContent = String(analysis.totalOccurrences);
    summarySection.hidden = false;
  }

  function renderTable(results) {
    resultsBody.textContent = "";
    results.forEach((row, index) => {
      const tr = document.createElement("tr");
      [String(index + 1), row.term, String(row.count), row.alternative].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });
      resultsBody.appendChild(tr);
    });
    resultsSection.hidden = false;
  }

  async function analyze() {
    hideResults();

    if (!selectedFile) {
      setStatus("No file selected. Please choose a .txt, .pdf, or .docx file first.", "error");
      return;
    }
    const type = getFileType(selectedFile);
    if (!type) {
      setStatus("Unsupported file format. Please select a .txt, .pdf, or .docx file.", "error");
      return;
    }
    if (selectedFile.size === 0) {
      setStatus("The selected file is empty. Please choose a file that contains text.", "error");
      return;
    }

    let text;
    try {
      text = await extractText(selectedFile, type);
    } catch (err) {
      setStatus(
        err && err.userMessage
          ? err.userMessage
          : "The file could not be read. It may be damaged or not a valid ." + type + " file.",
        "error"
      );
      return;
    }

    if (text.trim().length === 0) {
      setStatus(
        type === "txt"
          ? "The selected file contains only whitespace and has no readable text."
          : "No readable text was found in this document (it may be empty or a scanned image).",
        "error"
      );
      return;
    }

    const analysis = Recognizer.analyzeText(text);
    renderSummary(selectedFile.name, analysis);

    if (analysis.totalOccurrences === 0) {
      setStatus(NO_MATCH_MESSAGE, "info");
      return;
    }

    renderTable(analysis.results);
    setStatus(
      "Analysis complete: " + analysis.distinctTerms + " distinct term(s), " +
        analysis.totalOccurrences + " total occurrence(s) found.",
      "success"
    );
  }

  function clearAll() {
    fileInput.value = "";
    selectFile(null);
  }

  fileInput.addEventListener("change", () => selectFile(fileInput.files[0]));
  analyzeBtn.addEventListener("click", analyze);
  clearBtn.addEventListener("click", clearAll);

  ["dragenter", "dragover"].forEach((evt) =>
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
    })
  );
  dropZone.addEventListener("drop", (e) => {
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) {
      fileInput.value = "";
      selectFile(file);
    }
  });
})();
