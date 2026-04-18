const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Google Gemini model string identifiers to test
    const modelsToTest = [
        'gemini-1.5-flash', 
        'gemini-1.5-flash-latest', 
        'gemini-2.0-flash-exp', 
        'gemini-1.5-flash-8b', 
        'gemini-1.5-pro',
        'gemini-1.0-pro'
    ];
    
    let worked = false;
    for (const modelName of modelsToTest) {
      try {
         const model = genAI.getGenerativeModel({ model: modelName });
         const result = await model.generateContent("hello");
         console.log(`[SUCCESS] Model ${modelName} WORKED! Result: ${result.response.text().substring(0, 30)}`);
         worked = true;
      } catch (e) {
         console.log(`[FAILED] Model ${modelName} FAILED: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Setup error", err);
  }
}

listModels();
