# Domain Cleaner

A fast, browser-based tool for cleaning and normalizing domain names from URLs. This tool handles complex TLDs (like .co.uk) correctly using the Mozilla Public Suffix List.

## Features

- Clean and normalize domain names from URLs
- Handle complex TLDs correctly (e.g., .co.uk, .com.au)
- Remove www, http://, https://, and other protocols
- Remove trailing slashes and subdomains
- Preserve input order
- Process up to 1000 URLs in under 10 seconds
- Works entirely in the browser (no server required)
- Keyboard shortcut support (Ctrl/Cmd + Enter)

## Usage

1. Open `index.html` in your web browser
2. Enter URLs in the input textarea (one per line)
3. Click "Clean Domains" or press Ctrl/Cmd + Enter
4. Get your cleaned domains in the output textarea

## Example Input/Output

Input:
```
https://www.example.com/path
http://sub.domain.co.uk/
HTTPS://WWW.Google.COM/
blog.wordpress.com
```

Output:
```
example.com
domain.co.uk
google.com
wordpress.com
```

## Technical Details

- Uses the Mozilla Public Suffix List for accurate TLD handling
- Processes URLs in chunks to maintain browser responsiveness
- Includes progress indicator and timing statistics
- Fully client-side processing
- No external dependencies except for the Public Suffix List

## Hosting

To host this tool on GitHub Pages:

1. Create a new repository on GitHub
2. Push these files to the repository
3. Go to repository Settings > Pages
4. Enable GitHub Pages and select the main branch
5. Your tool will be available at `https://[username].github.io/[repository-name]`

## License

MIT License 