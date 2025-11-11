import { useEffect, useState } from "react";
import "./App.css";

function Confirmation() {
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    // Retrieve PDF data from sessionStorage
    const storedPdfData = sessionStorage.getItem("consentFormPdf");
    if (storedPdfData) {
      setPdfData(storedPdfData);
    }
  }, []);

  const handleDownload = () => {
    if (pdfData) {
      // Create a blob from the base64 data
      const byteCharacters = atob(pdfData.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "AI_Consent_Form.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const doctorEmail = "fairmontobgyn@gmail.com"; // Doctor's email address

  return (
    <div className="form-container">
      <div className="confirmation-content">
        <div className="success-icon">✓</div>
        <h1>Form Completed Successfully!</h1>
        <p className="confirmation-message">
          Thank you for completing the AI Consent Form. Please download your completed form and email it to the doctor's office.
        </p>
        
        <div className="email-instructions">
          <h3>Next Steps:</h3>
          <ol>
            <li>Download your completed form using the button below</li>
            <li>Email the PDF to: <strong>{doctorEmail}</strong></li>
            <li>Include your name and any relevant information in the email</li>
          </ol>
        </div>

        <button 
          type="button" 
          onClick={handleDownload}
          className="download-button"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default Confirmation;

