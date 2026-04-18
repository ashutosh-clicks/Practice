const PDFParser = require("pdf2json");
const fs = require('fs');

async function test() {
  const dir = './public/uploads';
  const files = fs.readdirSync(dir);
  if(files.length === 0) { console.log("No files to parse"); return; }
  
  for (const file of files) {
    const filePath = `${dir}/${file}`;
    console.log("Testing:", filePath);
    
    try {
      const extractedText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        
        pdfParser.on("pdfParser_dataError", (errData) => {
            reject(new Error(errData.parserError));
        });
        pdfParser.on("pdfParser_dataReady", () => {
          resolve(pdfParser.getRawTextContent());
        });
        pdfParser.loadPDF(filePath);
      });
      
      console.log("SUCCESS length:", extractedText.length);
    } catch(e) {
      console.log("CAUGHT EXCEPTION:", e.message);
    }
  }
}
test();
