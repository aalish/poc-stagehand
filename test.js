function parseClaudeObject(text) {
    try {
      const obj = (new Function(`return (${text.trim()})`))();
      return obj;
    } catch (error) {
      console.error("❌ Failed to parse Claude's object:\n", text, "\nError:", error.message);
      return null;
    }
  }
  
  const rawClaudeResponse = `
  {
    name: '//*[@id="client-first-name"]',
    email: '//*[@id="client-email"]',
    phone: '//*[@id="client-new-phone"]',
    address: '//*[@id="summary-postal-code"]',
    document: '//*[@id="client-document"]',
  }
  `;
  
  const parsedResult = parseClaudeObject(rawClaudeResponse);
  
  console.log("✅ Parsed result:", parsedResult);
  