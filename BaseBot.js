class BaseBot {
    constructor(page) {
      this.page = page;
    }
  
    async loadPage(url) {
      try {
        await this.page.goto(url, { waitUntil: 'networkidle2' });
        console.log(`✅ Loaded page: ${url}`);
      } catch (error) {
        console.log(`❌ Failed to load page: ${error}`);
      }
    }
  
    async waitUntil(xpath) {
      try {
        for (let i = 0; i < 10; i++) {
          const elementHandle = await this.page.evaluateHandle((xp) => {
            const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue;
          }, xpath);
          if (elementHandle) return elementHandle;
          await new Promise(res => setTimeout(res, 1000)); // retry
        }
        throw new Error(`Element with XPath ${xpath} not found.`);
      } catch (error) {
        console.log(`❌ waitUntil failed for ${xpath}: ${error}`);
        return null;
      }
    }
  
    async click(xpath) {
      try {
        const elementHandle = await this.waitUntil(xpath);
        if (elementHandle) {
          await elementHandle.click();
          console.log(`✅ Clicked element at XPath: ${xpath}`);
        } else {
          throw new Error(`Element not found: ${xpath}`);
        }
      } catch (error) {
        console.log(`❌ Error clicking ${xpath}: ${error}. Trying forced click.`);
        await this.forceClick(xpath);
      }
    }
  
    async forceClick(xpath) {
      try {
        await this.page.evaluate((xp) => {
          const element = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (element) {
            element.scrollIntoView({ behavior: 'instant', block: 'center' });
            element.click();
          }
        }, xpath);
        console.log(`✅ Forced click on XPath: ${xpath}`);
      } catch (error) {
        console.log(`❌ Forced click failed for ${xpath}: ${error}`);
      }
    }
  
    async scrollToView(xpath) {
      try {
        await this.page.evaluate((xp) => {
          const element = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (element) {
            element.scrollIntoView({ behavior: 'instant', block: 'center' });
          }
        }, xpath);
        console.log(`✅ Scrolled to element at XPath: ${xpath}`);
      } catch (error) {
        console.log(`❌ Failed to scroll to element ${xpath}: ${error}`);
      }
    }
  
    async clickButtonByText(value) {
      try {
        const isXPath = value.trim().startsWith('//') || value.trim().startsWith('.//');
        const searchXPath = isXPath ? value : `//*[normalize-space(text())='${value}']`;
  
        console.log(`[INFO] Searching elements with XPath: ${searchXPath}`);
        const elements = await this.page.evaluateHandle((xp) => {
          const iterator = document.evaluate(xp, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
          const nodes = [];
          let node = iterator.iterateNext();
          while (node) {
            nodes.push(node);
            node = iterator.iterateNext();
          }
          return nodes;
        }, searchXPath);
  
        const elementHandles = await elements.getProperties();
  
        if (!elementHandles.size) {
          console.log(`[WARN] No elements found with: ${value}`);
          return false;
        }
  
        for (const [index, handle] of Array.from(elementHandles.values()).entries()) {
          console.log(`\n[INFO] Trying element ${index + 1}...`);
          if (await this.tryClick(handle, "element")) return true;
          console.log(`[ERROR] All attempts failed for this element.`);
        }
  
        return false;
      } catch (error) {
        console.log(`❌ clickButtonByText failed for ${value}: ${error}`);
        return false;
      }
    }
  
    async tryClick(elementHandle, label) {
      if (!elementHandle) {
        console.log(`[ERROR] ${label} element handle is null.`);
        return false;
      }
  
      try {
        const xpath = await this.getXPath(elementHandle);
        console.log(`[INFO] Trying to click ${label} with XPath: ${xpath}`);
        await this.scrollToElement(elementHandle);
        await elementHandle.click();
        console.log(`[SUCCESS] Clicked ${label} successfully!`);
        return true;
      } catch (error) {
        console.log(`[ERROR] Failed to click ${label}: ${error}`);
        return false;
      }
    }
  
    async scrollToElement(elementHandle) {
      try {
        await this.page.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          window.scrollBy({
            top: rect.top + window.pageYOffset - (window.innerHeight / 2),
            behavior: 'instant'
          });
          el.scrollIntoView({ behavior: 'instant', block: 'center' });
        }, elementHandle);
        console.log("[INFO] Scrolled to element.");
      } catch (error) {
        console.log(`❌ Failed to scroll to element: ${error}`);
      }
    }
  
    async getXPath(elementHandle) {
      try {
        const xpath = await this.page.evaluate((el) => {
          if (!el) return "[Element not found]";
          function absoluteXPath(element) {
            if (element.nodeType !== Node.ELEMENT_NODE) return '';
            const path = [];
            while (element.nodeType === Node.ELEMENT_NODE) {
              let index = 1;
              let sibling = element.previousSibling;
              while (sibling) {
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) index++;
                sibling = sibling.previousSibling;
              }
              path.unshift(`${element.nodeName.toLowerCase()}[${index}]`);
              element = element.parentNode;
            }
            return `/${path.join('/')}`;
          }
          return absoluteXPath(el);
        }, elementHandle);
        return xpath;
      } catch (error) {
        console.log(`❌ Failed to get XPath: ${error}`);
        return "[XPath Error]";
      }
    }
  
    async inputText(selector, text) {
      try {
        await this.page.waitForSelector(selector, { timeout: 10000 });
        await this.page.type(selector, text, { delay: 100 });
        console.log(`✅ Inputted text "${text}" into "${selector}".`);
      } catch (error) {
        console.log(`❌ Failed to input text into ${selector}: ${error}`);
      }
    }
  }
  
  module.exports = BaseBot;
  