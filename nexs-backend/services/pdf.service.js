const html_to_pdf = require('html-pdf-node');
const { execSync } = require('child_process');
const fs = require('fs');

// Common Chrome/Chromium paths on Linux servers
const CHROME_PATHS = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/local/bin/chromium',
    '/usr/local/bin/chrome',
    '/snap/bin/chromium',
];

function findSystemChrome() {
    // Check known paths
    for (const p of CHROME_PATHS) {
        if (fs.existsSync(p)) return p;
    }
    // Try `which` as last resort
    try {
        const result = execSync('which google-chrome chromium-browser chromium 2>/dev/null | head -1', { timeout: 2000 })
            .toString().trim();
        if (result) return result;
    } catch {}
    return null;
}

const SYSTEM_CHROME = findSystemChrome();
if (SYSTEM_CHROME) {
    console.log(`[PDF] Using system Chrome: ${SYSTEM_CHROME}`);
} else {
    console.warn('[PDF] No system Chrome found — html-pdf-node will use bundled Chromium');
}

// Launch args required on Linux servers (no sandbox for root/VM environments)
const LAUNCH_ARGS = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
];

/**
 * PDF Service - Handles HTML to PDF conversion
 */
class PDFService {
    /**
     * Convert HTML content to PDF buffer
     * @param {string} htmlContent - HTML to convert
     * @param {Object} options - Conversion options
     * @returns {Promise<Buffer>} PDF buffer
     */
    async generateFromHtml(htmlContent, options = {}) {
        try {
            const file = { content: htmlContent };
            const launchOptions = {
                args: LAUNCH_ARGS,
                ...(SYSTEM_CHROME && { executablePath: SYSTEM_CHROME }),
            };

            const pdfOptions = {
                format: 'A4',
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                },
                printBackground: true,
                ...options,
                args: LAUNCH_ARGS,
                ...(SYSTEM_CHROME && { executablePath: SYSTEM_CHROME }),
            };

            const pdfBuffer = await html_to_pdf.generatePdf(file, pdfOptions);
            return pdfBuffer;
        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error('Failed to generate PDF from HTML');
        }
    }
}

module.exports = new PDFService();
