const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const urls = [
        'https://bill.pitc.com.pk/lescobill',
        'https://bill.pitc.com.pk/fescobill',
        'https://bill.pitc.com.pk/mepcobill'
    ];

    for (const url of urls) {
        console.log(`--- Inspecting ${url} ---`);
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Get all input fields
            const inputs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('input')).map(el => ({
                    name: el.name,
                    id: el.id,
                    type: el.type,
                    placeholder: el.placeholder
                }));
            });
            console.log('Inputs:', inputs);

            // Get all buttons
            const buttons = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('button, input[type="submit"]')).map(el => ({
                    text: el.innerText || el.value,
                    type: el.type,
                    id: el.id,
                    class: el.className
                }));
            });
            console.log('Buttons:', buttons);

        } catch (error) {
            console.error(`Error visiting ${url}:`, error.message);
        }
    }

    await browser.close();
})();
