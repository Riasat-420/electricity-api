const puppeteer = require('puppeteer');

const lesco = async (ref) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        // Using PITC as it is a reliable backend for multiple DISCOs
        const url = 'https://bill.pitc.com.pk/lescobill';
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Try to find the reference input. Common names: refno, reference, id
        // We will try a few common selectors.
        const inputSelector = 'input[name="refno"], input[name="reference"], input[type="text"]';
        await page.waitForSelector(inputSelector, { timeout: 10000 });

        // Clear and type reference number
        // Ensure we are typing into the correct field (usually the first text input)
        const inputs = await page.$$(inputSelector);
        if (inputs.length > 0) {
            await inputs[0].type(ref);
        } else {
            throw new Error('Reference input field not found');
        }

        // Click submit button
        const submitSelector = 'button[type="submit"], input[type="submit"]';
        await page.waitForSelector(submitSelector, { timeout: 5000 });
        await page.click(submitSelector);

        // Wait for result
        // PITC usually shows a table or a specific div with bill details
        // We wait for some content that indicates success or failure
        await page.waitForFunction(
            () => document.body.innerText.includes('Bill Month') || document.body.innerText.includes('Consumer Name') || document.body.innerText.includes('Invalid Reference'),
            { timeout: 20000 }
        );

        const errorCheck = await page.evaluate(() => document.body.innerText.includes('Invalid Reference') || document.body.innerText.includes('Record Not Found'));
        if (errorCheck) {
            throw new Error('Invalid Reference Number or Record Not Found');
        }

        // Extract data
        const data = await page.evaluate(() => {
            const getText = (text) => {
                const el = Array.from(document.querySelectorAll('td, th, div, span')).find(e => e.innerText.includes(text));
                return el ? el.nextElementSibling?.innerText?.trim() || el.innerText.split(':').pop().trim() : '';
            };

            // PITC specific extraction strategy might be needed if generic fails
            // But let's try to grab by label text which is more robust to layout changes

            // Helper to find value by label in a table
            const getTableValue = (label) => {
                const cells = Array.from(document.querySelectorAll('td'));
                const labelCell = cells.find(td => td.innerText.trim().includes(label));
                return labelCell ? labelCell.nextElementSibling?.innerText?.trim() : '';
            };

            return {
                company: 'LESCO',
                consumer_name: getTableValue('Name') || getTableValue('Consumer Name'),
                reference_number: getTableValue('Reference No'),
                bill_month: getTableValue('Bill Month'),
                due_date: getTableValue('Due Date'),
                payable_within_duedate: getTableValue('Payable Within Due Date'),
                payable_after_duedate: getTableValue('Payable After Due Date'),
                units_consumed: getTableValue('Units Consumed') || getTableValue('Units'),
                bill_url: window.location.href
            };
        });

        await browser.close();
        return data;

    } catch (error) {
        await browser.close();
        throw new Error(`LESCO Scraping failed: ${error.message}`);
    }
};

module.exports = lesco;
