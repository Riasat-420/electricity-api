const puppeteer = require('puppeteer');

const tesco = async (ref) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        const url = 'https://bill.pitc.com.pk/tescobill';
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const inputSelector = 'input[name="refno"], input[name="reference"], input[type="text"]';
        await page.waitForSelector(inputSelector, { timeout: 10000 });

        const inputs = await page.$$(inputSelector);
        if (inputs.length > 0) {
            await inputs[0].type(ref);
        } else {
            throw new Error('Reference input field not found');
        }

        const submitSelector = 'button[type="submit"], input[type="submit"]';
        await page.waitForSelector(submitSelector, { timeout: 5000 });
        await page.click(submitSelector);

        await page.waitForFunction(
            () => document.body.innerText.includes('Bill Month') || document.body.innerText.includes('Consumer Name') || document.body.innerText.includes('Invalid Reference'),
            { timeout: 20000 }
        );

        const errorCheck = await page.evaluate(() => document.body.innerText.includes('Invalid Reference') || document.body.innerText.includes('Record Not Found'));
        if (errorCheck) {
            throw new Error('Invalid Reference Number or Record Not Found');
        }

        const data = await page.evaluate(() => {
            const getTableValue = (label) => {
                const cells = Array.from(document.querySelectorAll('td'));
                const labelCell = cells.find(td => td.innerText.trim().includes(label));
                return labelCell ? labelCell.nextElementSibling?.innerText?.trim() : '';
            };

            return {
                company: 'TESCO',
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
        throw new Error(`TESCO Scraping failed: ${error.message}`);
    }
};

module.exports = tesco;
