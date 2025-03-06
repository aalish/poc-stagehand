require('dotenv').config();
const puppeteer = require('puppeteer');
const BaseBot = require('./BaseBot');
const { findFormFieldXPaths } = require('./llm');

const PRODUCT_URL = "https://www.nike.com.ar/air-jordan-11-retro-bred-velvet-db5457-061/p";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--start-maximized',
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const bot = new BaseBot(page);

  await bot.loadPage(PRODUCT_URL);

  await page.waitForSelector("span.selecciona-talle-plain", { timeout: 15000 });

  const text = await page.$eval("span.selecciona-talle-plain", el => el.innerText);
  if (text.includes("Seleccionar Talle (US)")) {
    console.log("✅ Text appeared!");
  } else {
    console.log("❌ Text did not match!");
  }

  await bot.scrollToView("//div[@class='nikear-custom-sku-selector-0-x-skuSelectorOptionsList w-100 inline-flex flex-wrap ml2 items-center']");

  const size = "6";
  const sizeXPath = `//div[text()='${size}']`;
  console.log(`✅ Attempting to click size ${size} with XPath: ${sizeXPath}`);
  await bot.click(sizeXPath);
  console.log(`✅ Successfully clicked size ${size}.`);

  await bot.clickButtonByText("//span[text()='Agregar al Carrito']");
  console.log("✅ Clicked 'Agregar al Carrito'.");

  const checkoutXPath = "//div[text()='Iniciar compra']";
  await bot.waitUntil(checkoutXPath);
  await bot.clickButtonByText(checkoutXPath);
  console.log("✅ Clicked 'Iniciar compra'.");

  await bot.click("//span[text()='Agregar al Carrito']");
  console.log("✅ Clicked 'Add to Bag'.");
  await new Promise(res => setTimeout(res, 6000));
  await page.goto('https://www.nike.com.ar/checkout#/orderform', {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  // Extract form inputs with attributes
  const formInputs = await page.$$eval('form input', inputs =>
    inputs.map(input => ({
      type: input.type || null,
      id: input.id || null,
      name: input.name || null,
      placeholder: input.placeholder || null,
      class: input.className || null,
      label: (() => {
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        return label ? label.innerText : null;
      })()
    }))
  );
  function cleanJSONString(text) {
    try {
      if (typeof text !== 'string') {
        console.warn("⚠️ Input was not a string. Converting:", text);
        text = JSON.stringify(text);
      }
  
      text = text.trim();
  
      const obj = (new Function(`return (${text})`))();
      return obj;
    } catch (error) {
      console.error("❌ Failed to parse Claude's object:\n", text, "\nError:", error.message);
      return null;
    }
  }
  
  // Calculate XPath for each input
  const formInputsWithXPaths = await Promise.all(
    formInputs.map(async (input) => {
      const xpath = await page.evaluate((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const idx = (sib, name) => sib ? 1 + idx(sib.previousElementSibling, name) : 1;
        const segs = el => !el || el.nodeType !== 1
          ? ['']
          : el.id
            ? [`//*[@id="${el.id}"]`]
            : [...segs(el.parentNode), `${el.tagName.toLowerCase()}[${idx(el.previousElementSibling, el.tagName.toLowerCase())}]`];
        return segs(el).join('/');
      }, input.id);

      return { ...input, xpath };
    })
  );

  console.log("✅ Extracted Form Inputs:", formInputsWithXPaths);

  const rawXPaths = await findFormFieldXPaths(formInputsWithXPaths);
  const xpaths = cleanJSONString(rawXPaths);
  
  if (!xpaths) {
    console.error("❌ Could not parse XPaths from Claude.");
    await browser.close();
    process.exit(1);
  }
  
  console.log("✅ Cleaned Form XPaths:", xpaths);
  

  console.log("✅ Mapped Form XPaths from Claude:", xpaths);

  const formData = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    address: "123 Main St",
    document: "12345678"
  };
  
  for (const [field, xpath] of Object.entries(xpaths)) {
    if (xpath && formData[field]) {
      try {
        const [input] = await page.$x(xpath);
        if (input) {
          await input.focus();
          await input.click({ clickCount: 3 }); // select existing value
          await input.type(formData[field], { delay: 50 }); // slow typing to avoid bot detection
          console.log(`✅ Filled ${field} at ${xpath}`);
        } else {
          console.warn(`⚠️ Could not find input for ${field} at ${xpath}`);
        }
      } catch (error) {
        console.error(`❌ Error filling ${field}:`, error);
      }
    } else {
      console.warn(`⚠️ No XPath from Claude for ${field}`);
    }
  }
  

  await new Promise(res => setTimeout(res, 6000000));
  await browser.close();
})();
