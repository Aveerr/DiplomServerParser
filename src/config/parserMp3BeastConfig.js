export const CONFIG = {
  url: 'https://mp3beast.cc',
  selectors: {
    musicList: "body > div.container.p-0 > div.row.p-0.m-0 > div > div > div",
    musicName: "div > div:nth-child(1) > p",
    musicDownload: "div > div:nth-child(3) > a",
    listByButton: "body > div.container.p-0 > div.row.p-0.m-0 > div > div > div > div > div.col-md-1.col-2.pr-md-2.p-0.m-auto.text-left.order-3 > a",
    songTitle: "body > div > div > div > h1",
    script: "body > script:nth-child(10)",
    musicLogo: "body > div > div > div > div > div > img",
    musicLength: "body > div > div > div > div > div > ul > li:nth-child(2) > p",
    searchInput: "body > div > div > div> div > nav > div:nth-child(2) > form > div > input"
  },
  regex: {
    musicDownload: /https:\/\/cdn\.odt-converter\.com\/download\.php\?id=[^"&]+&token=[^"&]+/
  },
  browserOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}; 