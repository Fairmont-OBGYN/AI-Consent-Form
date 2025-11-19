import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import "./App.css";
import Confirmation from "./Confirmation";

function App() {
  const patientSigRef = useRef();
  const witnessSigRef = useRef();

  const [form, setForm] = useState({
    name: "",
    dob: "",
    date: "",
    doctor: "",
  });

  const doctorEmailMap = {
  "Dr. Stephanie Rhone": "rhone.moa@gmail.com",
  "Dr. Chelsea Elwood": "elwood.moa@gmail.com",
  "Dr. Stephanie Fisher": "fisher.moa@gmail.com",
  "Dr. Ana Sosa Cazales": "sosacazales.moa@gmail.com",
};

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });    
  };

  const clearSignatures = () => {
    if (patientSigRef.current) {
      patientSigRef.current.clear();
    }
    if (witnessSigRef.current) {
      witnessSigRef.current.clear();
    }
  };

  // Function to generate PDF and return as base64
  const generatePDF = (patientSig, witnessSig) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    pdf.setFont("helvetica");
    
    const pageHeight = pdf.internal.pageSize.height;

    // Header - Left aligned, bold
    let yPos = 20;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${form.doctor} Inc.`, 20, yPos);
    yPos += 4;
    pdf.text("Fairmont Obstetrics & Gynecology", 20, yPos);
    yPos += 4;
    pdf.text("915-750 W Broadway, Vancouver, BC V5Z 1H8", 20, yPos);
    yPos += 4;
    pdf.text("Phone: 604-878-8050 Fax: 604-875-8099", 20, yPos);

    // Title - Left aligned, bold
    yPos += 12;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Patient Consent Form for Use of AI Scribe Technology", 20, yPos);

    // Consent paragraphs - Left aligned
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const lineHeight = 5;
    const maxWidth = 170;
    const leftMargin = 20;

    // Paragraph 1
    const para1 = `To enhance the quality of care and improve documentation efficiency, ${form.doctor} utilizes an AI scribe tool during patient visits. This technology assists with note-taking by generating a temporary audio recording of the conversation. The purpose is to allow the provider to focus more fully on the patient rather than typing during the visit.`;
    const para1Lines = pdf.splitTextToSize(para1, maxWidth);
    para1Lines.forEach((line) => {
      pdf.text(line, leftMargin, yPos);
      yPos += lineHeight;
    });
    yPos += 3;

    // Paragraph 2
    const para2 = `With your permission, the AI scribe will create a temporary audio recording solely for the purpose of drafting a clinical summary. This summary will be reviewed and finalized by ${form.doctor} before being added to the patient's medical chart.`;
    const para2Lines = pdf.splitTextToSize(para2, maxWidth);
    para2Lines.forEach((line) => {
      pdf.text(line, leftMargin, yPos);
      yPos += lineHeight;
    });
    yPos += 3;

    // Paragraph 3
    const para3 = "Participation in this process is entirely optional. Your privacy is protected throughout, and you may decline or withdraw consent at any time without any impact on the quality or continuity of care.";
    const para3Lines = pdf.splitTextToSize(para3, maxWidth);
    para3Lines.forEach((line) => {
      pdf.text(line, leftMargin, yPos);
      yPos += lineHeight;
    });
    yPos += 3;

    // Paragraph 4
    const para4 = "By signing below, you acknowledge understanding of the above, that you have received the AI Scribe information sheet and grants permission of use to the AI scribe during the visit.";
    const para4Lines = pdf.splitTextToSize(para4, maxWidth);
    para4Lines.forEach((line) => {
      pdf.text(line, leftMargin, yPos);
      yPos += lineHeight;
    });

    // Signature section - Two column table layout
    yPos += 10;
    
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = 20;
    }
    
    const tableStartY = yPos;
    const col1X = 20;
    const col2X = 110;
    const rowHeight = 15;
    const lineY = tableStartY + 4;

    // Draw table borders
    pdf.line(col1X, tableStartY, 190, tableStartY);
    pdf.line(col1X, tableStartY + rowHeight, 190, tableStartY + rowHeight);
    pdf.line(col1X, tableStartY + rowHeight * 2, 190, tableStartY + rowHeight * 2);
    pdf.line(col1X, tableStartY + rowHeight * 3, 190, tableStartY + rowHeight * 3);
    pdf.line(col2X, tableStartY, col2X, tableStartY + rowHeight * 3);

    // Row 1: Patient Name | DOB
    pdf.setFontSize(10);
    pdf.text("Patient Name:", col1X + 2, lineY);
    pdf.text(form.name || "_________________", col1X + 2, lineY + 6);
    
    pdf.text("DOB:", col2X + 2, lineY);
    pdf.text(form.dob || "_________________", col2X + 2, lineY + 6);

    // Row 2: Patient Signature | Date
    const row2Y = tableStartY + rowHeight;
    pdf.text("Patient Signature:", col1X + 2, row2Y + 4);
    const sigWidth = 60;
    const sigHeight = 12;
    if (patientSig) {
      pdf.addImage(patientSig, "PNG", col1X + 2, row2Y + 6, sigWidth, sigHeight);
    } else {
      pdf.text("_________________", col1X + 2, row2Y + 10);
    }
    
    pdf.text("Date:", col2X + 2, row2Y + 4);
    pdf.text(form.date || "_________________", col2X + 2, row2Y + 10);

    // Row 3: Witness Signature | Date
    const row3Y = tableStartY + rowHeight * 2;
    pdf.text("Witness Signature:", col1X + 2, row3Y + 4);
    if (witnessSig) {
      pdf.addImage(witnessSig, "PNG", col1X + 2, row3Y + 6, sigWidth, sigHeight);
    } else {
      pdf.text("_________________", col1X + 2, row3Y + 10);
    }
    
    pdf.text("Date:", col2X + 2, row3Y + 4);
    pdf.text(form.date || "_________________", col2X + 2, row3Y + 10);

    return pdf;
  };


  const handleSubmit = async () => {
    console.log("handleSubmit called");
    
    try {
      // Get signatures - check if they're empty
      let patientSig = null;
      let witnessSig = null;
      
      if (patientSigRef.current && !patientSigRef.current.isEmpty()) {
        try {
          const canvas = patientSigRef.current.getCanvas();
          patientSig = canvas.toDataURL("image/png");
        } catch (e) {
          console.warn("Error getting patient signature:", e);
        }
      }
      
      if (witnessSigRef.current && !witnessSigRef.current.isEmpty()) {
        try {
          const canvas = witnessSigRef.current.getCanvas();
          witnessSig = canvas.toDataURL("image/png");
        } catch (e) {
          console.warn("Error getting witness signature:", e);
        }
      }

      // Warn if signatures are missing but allow PDF generation
      if (!patientSig || !witnessSig) {
        const proceed = window.confirm("One or both signatures are missing. Generate PDF without signatures?");
        if (!proceed) {
          return;
        }
      }

      if (!form.doctor) {
        alert("Please select a doctor before submitting.");
        return;
      }

      console.log("Creating PDF...");
      const pdf = generatePDF(patientSig, witnessSig);
      
      // Get PDF as base64 string
      const pdfBase64 = pdf.output("datauristring");
      
      // Store PDF in sessionStorage for confirmation page
      sessionStorage.setItem("consentFormPdf", pdfBase64);

      const selectedDoctorEmail = doctorEmailMap[form.doctor];
      sessionStorage.setItem("doctorEmail", selectedDoctorEmail);
      
      // Navigate to confirmation page
      setShowConfirmation(true);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      alert(`An error occurred while generating the PDF: ${error.message}\n\nCheck the console for more details.`);
    }
  };


  // Show confirmation page if form is submitted
  if (showConfirmation) {
    return <Confirmation />;
  }

  return (
    <div className="form-container">
      <div className="header">
        <h2>Fairmont Obstetrics & Gynecology</h2>
        <p>915-750 W Broadway, Vancouver, BC V5Z 1H8</p>
        <p>Phone: 604-878-8050 | Fax: 604-875-8099</p>
      </div>

      <h1>Patient Consent Form for Use of AI Scribe Technology</h1>

      <div className="intro-section">
        <p>
          To enhance the quality of care and improve documentation efficiency, the doctors at Fairmont Obstetrics & Gynecology utilizes an AI scribe tool during patient visits. This technology
          assists with note-taking by generating a temporary audio recording of
          the conversation. The purpose is to allow the provider to focus more fully on the patient rather than typing during the visit.
        </p>
        <p>
          With your permission, the AI scribe will create a temporary audio recording solely for the purpose of drafting a clinical summary. This summary will be reviewed and finalized by the doctors at Fairmont Obstetrics & Gynecology before being added to the patient's medical chart.
        </p>
        <p>
          Participation in this process is entirely optional. Your privacy is protected throughout, and you may decline or withdraw consent at any time without any impact on the quality or continuity of care.
        </p>
        <p>
          By signing below, you acknowledge understanding of the above, that you have received the AI Scribe information sheet and grants permission of use to the AI scribe during the visit.
        </p>
      </div>

      <div className="form-group">
        <label>
          Patient Name:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-group">
        <label>
          Date of Birth:
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-group">
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-group">
        <label>
          Doctor:
          <select name="doctor" value={form.doctor} onChange={handleChange}>
            <option value="">Select a doctor</option>
            <option value="Dr. Stephanie Rhone">Dr. Stephanie Rhone</option>
            <option value="Dr. Chelsea Elwood">Dr. Chelsea Elwood</option>
            <option value="Dr. Stephanie Fisher">Dr. Stephanie Fisher</option>
            <option value="Dr. Ana Sosa Cazales">Dr. Ana Sosa Cazales</option>
          </select>
        </label>
      </div>

      <div className="sig-section">
        <h3>Patient Signature</h3>
        <SignatureCanvas
          ref={patientSigRef}
          penColor="black"
          canvasProps={{ className: "signature-canvas" }}
        />
      </div>

      <div className="sig-section">
        <h3>Witness Signature</h3>
        <SignatureCanvas
          ref={witnessSigRef}
          penColor="black"
          canvasProps={{ className: "signature-canvas" }}
        />
      </div>

      <div className="button-row">
        <button type="button" onClick={clearSignatures}>Clear Signatures</button>
        <button type="button" onClick={handleSubmit}>Submit Form</button>
      </div>
    </div>
  );
}

export default App;
