const PDFParser = require("pdf2json");
const fs = require('fs');

async function test() {
  const dir = './public/uploads';
  const files = fs.readdirSync(dir);
  if(files.length === 0) { console.log("No files to parse"); return; }
  
  const filePath = `${dir}/${files[0]}`;
  console.log("Testing:", filePath);
  
  try {
    const extractedText = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData) => {
          console.error("DATA ERROR", errData);
          reject(new Error(errData.parserError));
      });
      pdfParser.on("pdfParser_dataReady", () => {
          console.log("Ready!");
        resolve(pdfParser.getRawTextContent());
      });
      console.log("Loading PDF...");
      pdfParser.loadPDF(filePath);
    });
    
    console.log("Text length:", extractedText.length);
  } catch(e) {
    console.log("Caught:", e);
  }
}
test();
