import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

(async () => {
  // Initialize Stagehand
  const stagehand = new Stagehand();
  await stagehand.init();

  // Navigate to the product page
  await stagehand.page.goto('https://www.nike.com.ar/air-jordan-11-retro-bred-velvet-db5457-061/p');

  // Use AI to select size 6.5
  const actionResult = await stagehand.act({ action: 'select size 6.5' });
  console.log('Action Result:', actionResult);

  // Close the browser
  await stagehand.close();
})();
