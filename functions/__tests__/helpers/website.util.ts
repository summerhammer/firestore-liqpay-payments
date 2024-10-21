import puppeteer from "puppeteer";

export async function submit(
  url: string,
  cardNumber: string,
): Promise<void> {
  console.info("Running checkout form in headless mode... at ", url);
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();

    console.log("Waiting for the checkout form to load...");

    await page.goto(url);

    await page.waitForSelector("input[el=\"Card\"]", {
      timeout: 10000,
    });

    console.log("Filling out the checkout form...");

    await page.focus("input[el=\"Card\"]");
    await page.keyboard.type(cardNumber, { delay: 100 });

    await page.focus("input[el=\"MMYY\"]");
    await page.keyboard.type("1242");

    await page.focus("input[el=\"CardCvv\"]");
    await page.keyboard.type("123");

    await page.focus("input[el=\"CardholderFirstName\"]");
    await page.keyboard.type("John");

    await page.focus("input[el=\"CardholderLastName\"]");
    await page.keyboard.type("Doe");

    console.log("Submitting the checkout form...");

    const sendButton = await page.$("div[el=\"Send\"]");
    await sendButton!.click();

    console.log("Closing the browser...");
    await browser.close();
    console.log("Browser closed.");
  } catch (exception) {
    console.error(exception);
  } finally {
    await browser.close();
  }
}
