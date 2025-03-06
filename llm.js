require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function findSizeButtonXPath(html, size = "6.5") {
  const prompt = `
You are helping to automate a sneaker purchase on a website. 

From the following HTML snippet, find the XPath of the button or element that selects shoe size "${size}". 
The page may be in any language. 

Return only the most accurate XPath selector. Just write xpath selector and nothing else. The shoe size must be exactly "${size}". The xpath should be correct and clickable.
  
HTML:
${html.slice(0, 4000)}
  `;

  const completion = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.content[0].text.trim();
}

async function findFormFieldXPaths(inputsJson) {
  const prompt = `
You are analyzing a checkout form's inputs. The form can be in any language.

Each input has attributes like type, id, name, placeholder, class, label, and its XPath.It may be in any language other than english.

From the inputs below, map the best matching input field to each of the following:
- name (first name or full name)
- email
- phone number
- address
- document number (DNI, passport, ID, etc.)

Return ONLY a JSON object like this without anything else like explanation:
{
  "name": "xpath",
  "email": "xpath",
  "phone": "xpath",
  "address": "xpath",
  "document": "xpath"
}

If a field is NOT present, use null for its value.

Inputs JSON:
${JSON.stringify(inputsJson)}
`;

  const completion = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = completion.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("❌ Failed to parse JSON from Claude:", text);
    return null;
  }
}

module.exports = {
  findSizeButtonXPath,
  findFormFieldXPaths,
};
