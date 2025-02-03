// Initialize the Public Suffix List
let psl = null;

// Fetch the latest public suffix list from the official source
fetch('https://publicsuffix.org/list/public_suffix_list.dat')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch Public Suffix List');
        }
        return response.text();
    })
    .then(data => {
        try {
            psl = new PublicSuffixList(data);
            console.log('Public Suffix List loaded successfully');
        } catch (e) {
            console.error('Failed to initialize PSL:', e);
        }
    })
    .catch(error => {
        console.error('Error loading Public Suffix List:', error);
        document.getElementById('stats').textContent = 'Warning: Using fallback domain parsing (less accurate)';
    });

function cleanDomains() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const stats = document.getElementById('stats');
    const cleanButton = document.getElementById('clean');
    
    // Disable button during processing
    cleanButton.disabled = true;
    
    const startTime = performance.now();
    const urls = input.value.trim().split('\n').filter(url => url.trim());
    
    if (urls.length === 0) {
        stats.textContent = 'Please enter at least one URL';
        cleanButton.disabled = false;
        return;
    }

    // Process URLs in chunks to maintain responsiveness
    const chunkSize = 100;
    const results = new Array(urls.length);
    let processed = 0;

    function processChunk(startIndex) {
        const endIndex = Math.min(startIndex + chunkSize, urls.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            results[i] = cleanDomain(urls[i].trim());
            processed++;
        }

        // Update progress
        const progress = (processed / urls.length * 100).toFixed(1);
        stats.textContent = `Processing... ${progress}%`;

        if (endIndex < urls.length) {
            // Process next chunk
            setTimeout(() => processChunk(endIndex), 0);
        } else {
            // All done
            output.value = results.join('\n');
            const endTime = performance.now();
            const timeElapsed = ((endTime - startTime) / 1000).toFixed(2);
            stats.textContent = `Processed ${urls.length} URLs in ${timeElapsed} seconds`;
            cleanButton.disabled = false;
        }
    }

    // Start processing
    processChunk(0);
}

function cleanDomain(url) {
    try {
        // Handle empty or invalid input
        if (!url) return '';
        
        // Add protocol if missing (required for URL parsing)
        if (!url.match(/^[a-zA-Z]+:\/\//)) {
            url = 'http://' + url;
        }

        // Parse URL
        const urlObj = new URL(url);
        let hostname = urlObj.hostname.toLowerCase();

        // Remove 'www.' if present
        hostname = hostname.replace(/^www\./, '');

        if (psl) {
            try {
                // Get the registrable domain using PSL
                const domain = psl.getDomain(hostname);
                if (domain) {
                    return domain;
                }
            } catch (e) {
                console.error('PSL processing error:', e);
            }
        }

        // Fallback method if PSL is not loaded or fails
        const parts = hostname.split('.');
        
        // If we have 2 parts or fewer, return as is
        if (parts.length <= 2) return hostname;

        // Known multi-part TLDs
        const knownTlds = [
            'co.uk', 'com.au', 'co.jp', 'co.nz', 'org.uk', 'me.uk',
            'co.in', 'net.uk', 'org.au', 'co.za', 'co.nz', 'com.br',
            'com.co', 'net.au', 'co.id', 'com.sg', 'org.za', 'edu.au'
        ];

        // Check for known multi-part TLDs
        for (const tld of knownTlds) {
            if (hostname.endsWith('.' + tld)) {
                const withoutTld = hostname.slice(0, -tld.length - 1).split('.');
                return withoutTld[withoutTld.length - 1] + '.' + tld;
            }
        }

        // For all other cases, return just the domain and TLD (last two parts)
        return parts.slice(-2).join('.');
    } catch (error) {
        console.error('Error processing URL:', url, error);
        return url; // Return original input if processing fails
    }
}

// Add keyboard shortcut (Ctrl/Cmd + Enter) to trigger cleaning
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        cleanDomains();
    }
});

// Copy to clipboard functionality
async function copyToClipboard() {
    const output = document.getElementById('output');
    const copyButton = document.getElementById('copy');
    const originalText = copyButton.textContent;

    try {
        await navigator.clipboard.writeText(output.value);
        copyButton.textContent = 'Copied!';
        copyButton.classList.add('success');
        
        // Reset button text and remove success class after animation
        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('success');
        }, 1500);
    } catch (err) {
        console.error('Failed to copy text:', err);
        copyButton.textContent = 'Failed to copy';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 1500);
    }
} 