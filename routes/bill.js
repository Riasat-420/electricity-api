const express = require('express');
const router = express.Router();
const scrapers = require('../scrapers');

router.get('/', async (req, res) => {
    let { company, ref } = req.query;

    if (!company || !ref) {
        return res.status(400).json({ status: 'error', message: 'Missing company or reference number' });
    }

    // Sanitize inputs
    company = company.trim().toLowerCase();
    ref = ref.trim();

    const scraper = scrapers[company];

    if (!scraper) {
        return res.status(400).json({ status: 'error', message: 'Invalid company. Supported: lesco, fesco, mepco, iesco, gepco, pesco, hesco, sepco, qesco, tesco' });
    }

    try {
        const result = await scraper(ref);
        res.json({ status: 'success', ...result });
    } catch (error) {
        console.error(`Error scraping ${company}:`, error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch bill details', error: error.message });
    }
});

module.exports = router;
