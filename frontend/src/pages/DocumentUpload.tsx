import { useState } from "react";
import "./DocumentUpload.css";

interface DocumentUploadProps {
  onComplete: () => void;
}

type DocumentStatus =
  | "idle"
  | "checking"
  | "invalid"
  | "valid"
  | "ocr";

function DocumentUpload({ onComplete }: DocumentUploadProps) {

  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] =
    useState<DocumentStatus>("idle");

  const [warning, setWarning] = useState("");

  const [documentType, setDocumentType] =
    useState("");

  /*
    Prototype document classifier.

    Later this can be replaced with actual
    OCR + AI document classification.
  */

  const detectDocumentType = (
    fileName: string
  ): string => {

    const name = fileName.toLowerCase();

    if (
      name.includes("prescription") ||
      name.includes("medicine") ||
      name.includes("doctor")
    ) {
      return "Prescription";
    }

    if (
      name.includes("blood") ||
      name.includes("cbc") ||
      name.includes("lab") ||
      name.includes("test") ||
      name.includes("pathology") ||
      name.includes("glucose") ||
      name.includes("sugar") ||
      name.includes("thyroid") ||
      name.includes("urine")
    ) {
      return "Blood / Laboratory Test Report";
    }

    if (
      name.includes("discharge") ||
      name.includes("discharge-summary")
    ) {
      return "Discharge Summary";
    }

    if (
      name.includes("xray") ||
      name.includes("x-ray") ||
      name.includes("mri") ||
      name.includes("ct") ||
      name.includes("scan") ||
      name.includes("ecg") ||
      name.includes("diagnostic")
    ) {
      return "Diagnostic / Imaging Report";
    }

    if (
      name.includes("medical") ||
      name.includes("health") ||
      name.includes("hospital") ||
      name.includes("report")
    ) {
      return "Medical Report";
    }

    /*
      Explicitly reject common non-medical documents.
    */

    if (
      name.includes("10th") ||
      name.includes("10") ||
      name.includes("certificate") ||
      name.includes("marksheet") ||
      name.includes("mark-sheet") ||
      name.includes("aadhaar") ||
      name.includes("aadhar") ||
      name.includes("pan") ||
      name.includes("resume") ||
      name.includes("college") ||
      name.includes("school") ||
      name.includes("degree") ||
      name.includes("id-card")
    ) {
      return "";
    }

    return "";
  };

  const handleFileChange = (
    selectedFile: File | null
  ) => {

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setWarning("");
    setDocumentType("");
    setStatus("checking");

    /*
      Simulated AI document verification.
    */

    setTimeout(() => {

      const detectedType =
        detectDocumentType(selectedFile.name);

      if (!detectedType) {

        setStatus("invalid");

        setWarning(
          "This document does not appear to be a valid medical record. MediKiosk only processes prescriptions, blood/laboratory reports, discharge summaries, diagnostic reports and other medical documents."
        );

        return;
      }

      setDocumentType(detectedType);
      setStatus("valid");

    }, 1200);
  };

  const handleRemove = () => {

    setFile(null);
    setStatus("idle");
    setWarning("");
    setDocumentType("");

  };

  const handleStartOCR = () => {

    setStatus("ocr");

    setTimeout(() => {

      setStatus("valid");

    }, 2500);
  };

  return (
    <div className="document-page">

      {/* HEADER */}

      <header className="document-header">

        <div className="document-logo">
          <span>✚</span>
          MediKiosk
        </div>

        <div className="document-team">
          Team <strong>NextGen</strong>
        </div>

      </header>

      <main className="document-container">

        {/* TITLE */}

        <div className="document-title">

          <span className="document-badge">
            MEDICAL DOCUMENT INTELLIGENCE
          </span>

          <h1>
            Upload Previous Medical Documents
          </h1>

          <p>
            Upload prescriptions, blood test reports,
            discharge summaries or other medical reports.
            MediKiosk will verify and extract relevant
            medical information.
          </p>

        </div>

        {/* CARD */}

        <div className="document-card">

          {/* =========================
              EMPTY STATE
          ========================= */}

          {!file && (
            <>

              <div className="upload-icon">
                📄
              </div>

              <h2>
                Upload Medical Document
              </h2>

              <p className="upload-description">
                Select a prescription, laboratory report,
                discharge summary or medical report.
              </p>

              {/* CHOOSE FILE */}

              <label className="choose-file-button">

                📁 Choose File

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(event) => {

                    const selected =
                      event.target.files?.[0] || null;

                    handleFileChange(selected);

                  }}
                />

              </label>

              <div className="supported-files">

                Supported:
                <span> JPG</span>
                <span> PNG</span>
                <span> PDF</span>

              </div>

              <div className="allowed-documents">

                <strong>
                  Accepted medical documents
                </strong>

                <div>
                  💊 Prescription
                  &nbsp; • &nbsp;
                  🧪 Blood / Lab Report
                  &nbsp; • &nbsp;
                  🏥 Discharge Summary
                  &nbsp; • &nbsp;
                  🩻 Diagnostic Report
                </div>

              </div>

            </>
          )}

          {/* =========================
              SELECTED FILE
          ========================= */}

          {file && (
            <div className="selected-file">

              <div className="file-icon">
                📄
              </div>

              <div className="file-details">

                <strong>
                  {file.name}
                </strong>

                <span>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>

              </div>

              <button
                className="remove-file"
                onClick={handleRemove}
              >
                ✕
              </button>

            </div>
          )}

          {/* =========================
              CHECKING
          ========================= */}

          {status === "checking" && (

            <div className="processing-box">

              <div className="spinner"></div>

              <h3>
                AI is checking your document...
              </h3>

              <p>
                Verifying whether the uploaded file
                is a medical document.
              </p>

            </div>

          )}

          {/* =========================
              INVALID DOCUMENT
          ========================= */}

          {status === "invalid" && (

            <div className="document-warning">

              <div className="warning-icon">
                ⚠️
              </div>

              <div className="warning-content">

                <h3>
                  Unsupported Document Detected
                </h3>

                <p>
                  {warning}
                </p>

                <div className="warning-example">

                  Example:
                  <strong>
                    {" "}10th certificate / marksheet
                  </strong>
                  {" "}is not a medical document.

                </div>

                <button
                  className="upload-another-button"
                  onClick={handleRemove}
                >
                  ← Upload Medical Document Instead
                </button>

              </div>

            </div>

          )}

          {/* =========================
              VALID DOCUMENT
          ========================= */}

          {status === "valid" && (

            <div className="ocr-area">

              <div className="verified-message">

                <span>✓</span>

                <div>
                  <strong>
                    Medical Document Verified
                  </strong>

                  <small>
                    Detected type: {documentType}
                  </small>
                </div>

              </div>

              {!documentType && (
                <div className="manual-warning">
                  Please upload a supported medical document.
                </div>
              )}

              {/* OCR BUTTON */}

              <button
                className="start-ocr-button"
                onClick={handleStartOCR}
              >
                🔍 Extract Medical Information
              </button>

              {/* SIMULATED EXTRACTION */}

              <div className="extraction-preview">

                <h2>
                  AI + OCR Extraction Preview
                </h2>

                <div className="confidence">
                  OCR Confidence: <strong>94%</strong>
                </div>

                <div className="extracted-item">

                  <span>
                    Document Type
                  </span>

                  <strong>
                    {documentType}
                  </strong>

                </div>

                <div className="extracted-item">

                  <span>
                    Diagnosis
                  </span>

                  <strong>
                    Fever with mild dehydration
                  </strong>

                </div>

                <div className="extracted-item">

                  <span>
                    Medicines
                  </span>

                  <strong>
                    Paracetamol 500 mg, ORS
                  </strong>

                </div>

                <div className="extracted-item">

                  <span>
                    Investigation
                  </span>

                  <strong>
                    Temperature: 101.2°F
                  </strong>

                </div>

                <div className="prototype-note">

                  ℹ️ This is a prototype OCR result.
                  In the final system, AI will extract
                  information directly from the uploaded
                  medical document.

                </div>

                <div className="ocr-actions">

                  <button
                    className="upload-another-button"
                    onClick={handleRemove}
                  >
                    Upload Another
                  </button>

                  <button
                    className="add-summary-button"
                    onClick={onComplete}
                  >
                    Add to Clinical Summary →
                  </button>

                </div>

              </div>

            </div>

          )}

          {/* =========================
              OCR PROCESSING
          ========================= */}

          {status === "ocr" && (

            <div className="processing-box">

              <div className="spinner"></div>

              <h3>
                Extracting Medical Information...
              </h3>

              <p>
                AI + OCR is reading the document and
                structuring relevant medical information.
              </p>

            </div>

          )}

        </div>

      </main>

      <footer className="document-footer">

        🔒 Medical documents are processed securely

        <span>•</span>

        SIH26047

        <span>•</span>

        Team NextGen

      </footer>

    </div>
  );
}

export default DocumentUpload;