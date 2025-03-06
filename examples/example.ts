/**
 * This file is meant to be used as a scratchpad for developing new evals.
 * To create a Stagehand project with best practices and configuration, run:
 *
 * npx create-browser-app@latest my-browser-app
 */

import { Stagehand } from "@/dist";
import StagehandConfig from "@/stagehand.config";

async function example() {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    headless: false,
    localBrowserLaunchOptions: {
      headless: false,
      chromiumSandbox: false,

      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    browserbaseSessionCreateParams: {
      projectId: StagehandConfig.projectId,
      browserSettings: {
        advancedStealth: true,
        solveCaptchas: true,
        logSession: true,
        recordSession: true,
        viewport: {
          width: 1280,
          height: 720,
        },
      },
    },
  });
  await stagehand.init();
  await stagehand.page.goto(
    "https://www.nike.com/t/blazer-mid-77-vintage-mens-shoes-nw30B2/BQ6806-100",
  );

  // await new Promise((res) => setTimeout(res, 50000000));
  // console.log("Anthropic Key:", process.env.ANTHROPIC_API_KEY);

  await stagehand.page.act("Select 'United States' under 'Americas'");
  await stagehand.page.goto(
    "https://www.nike.com/t/blazer-mid-77-vintage-mens-shoes-nw30B2/BQ6806-100",
  );
  // await stagehand.page.act("Wait until size options are visible");
  await new Promise((res) => setTimeout(res, 30000));

  await stagehand.page.act("Select size 5 from size grid selector");

  // await stagehand.page.act(
  //   "Under 'Select Size' select '7' as size just after this 'For easier entry, we recommend unlacing the top 4 eyelets and slightly loosening the laces farther down'",
  // // );
  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++==");
  await stagehand.page.click("//button[text()='Add to Bag']");
  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++==");
  // await stagehand.page.act("Click on 'Add to Bag' button");

  // await stagehand.page.act("Click on 'Add to Bag' button");
  // await stagehand.page.goto("https://www.nike.com/checkout/");
  console.log(
    "SLEEEEPINGGGGG ___________________________________________________",
  );
  // const sessionInfo = await stagehand.;
  // console.log("Session video URL:", sessionInfo.videoUrl);

  await new Promise((res) => setTimeout(res, 50000000));
  await stagehand.page.act("Click on 'Guest Checkout' button");

  await stagehand.page.act(
    "In the form enter these values as Email as 'prajwalchhetri011@gmail.com', First Name as 'Prajwal', Last Name as 'Chhetri', Address as '49 Denton Dr', City as 'San Antonio', State as 'Texas', Postal Code as '78213-4420', number as '(112) 566-5942' ",
  );

  await stagehand.page.act("Click on 'Save & Continue' button");
  await stagehand.close();
}

(async () => {
  await example();
})();
