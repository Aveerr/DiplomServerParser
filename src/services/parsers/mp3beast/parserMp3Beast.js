import e from 'express';
import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import ParseMp3BeastHomePage from './parseMp3BeastHomePage.js';
import { CONFIG } from '../../../config/parserMp3BeastConfig.js';
import { consola } from 'consola';

/**
 * Class responsible for processing music data from mp3beast
 * @class MusicProcessor
 */
class MusicProcessor {
  /**
   * @constructor
   * @param {Object} config - Configuration object
   */
  constructor(config = CONFIG) {
    this.config = config;
    this.browser = null;
    this.mainPage = null;
    this.processedItems = [];
    this.logger = consola.withTag('MusicProcessor');
  }

  /**
   * Waits for specified milliseconds
   * @param {number} ms - Time to wait in milliseconds
   * @returns {Promise<void>}
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sets the browser instance
   * @param {Browser} browser - Puppeteer browser instance
   */
  setBrowser(browser) {
    this.browser = browser;
  }

  /**
   * Sets the main page instance
   * @param {Page} mainPage - Puppeteer page instance
   */
  setMainPage(mainPage) {
    this.mainPage = mainPage;
  }

  /**
   * Blocks unnecessary resources to improve performance
   * @param {Page} page - Puppeteer page instance
   */
  async blockUnnecessaryResources(page) {
    try {
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });
    } catch (error) {
      throw new Error(`Failed to block resources: ${error.message}`);
    }
  }

  /**
   * Initializes the browser and main page
   * @throws {Error} If initialization fails
   */
  async initialize() {
    try {
      this.browser = await puppeteer.launch(this.config.browserOptions);
      this.mainPage = await this.browser.newPage();
      await this.blockUnnecessaryResources(this.mainPage);
      await this.mainPage.setUserAgent(this.config.userAgent);
      this.logger.success('Browser initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize browser:', error);
      throw new Error(`Failed to initialize browser: ${error.message}`);
    }
  }

  /**
   * Gets inner HTML content of elements
   * @param {ElementHandle|ElementHandle[]} elementHandle - Element or array of elements
   * @returns {Promise<string|string[]>} Inner HTML content
   */
  async getInnerHtml(elementHandle) {
    try {
      if (!elementHandle) {
        return null;
      }

      if (Array.isArray(elementHandle)) {
        return Promise.all(elementHandle.map(item => item.evaluate(el => el.innerHTML)));
      }

      return elementHandle.evaluate(el => el.innerHTML);
    } catch (error) {
      console.error('Error getting innerHTML:', error);
      return null;
    }
  }

  /**
   * Gets array of list buttons from the page
   * @returns {Promise<ElementHandle[]>} Array of button elements
   */
  async getArrayOfButtons() {
    try {
      const buttons = await this.mainPage.$$(this.config.selectors.listByButton);
      if (!buttons?.length) {
        this.logger.warn('No buttons found on the page');
        return [];
      }
      this.logger.info(`Found ${buttons.length} list by button`);
      return buttons.slice(0, 3);
    } catch (error) {
      this.logger.error('Failed to get buttons:', error);
      throw new Error(`Failed to get buttons: ${error.message}`);
    }
  }

  /**
   * Gets music properties from a page
   * @param {Page} page - Puppeteer page instance
   * @returns {Promise<Object>} Music properties object
   */
  async getMusicProperties(page) {
    try {
      const [songTitle, scriptContent] = await Promise.all([
        page.$eval(this.config.selectors.songTitle, e => e.textContent),
        page.$eval(this.config.selectors.script, e => e.innerHTML)
      ]);

      const musicDownload = scriptContent.match(this.config.regex.musicDownload)?.[0];
      await page.close();

      return { songTitle, musicDownload };
    } catch (error) {
      throw new Error(`Failed to get music properties: ${error.message}`);
    }
  }

  /**
   * Gets music properties from all pages
   * @param {Page[]} pages - Array of Puppeteer pages
   * @returns {Promise<Object[]>} Array of music properties
   */
  async getAllMusicProperties(pages) {
    try {
      const allMusicProperties = [];
      
      for (let i = 2; i < pages.length; i++) {
        try {
          const musicProperties = await this.getMusicProperties(pages[i]);
          musicProperties.page = i - 2;
          allMusicProperties.push(musicProperties);
          this.logger.debug(`Processed page ${i - 2}: ${musicProperties.songTitle}`);
        } catch (error) {
          this.logger.error(`Error getting properties for page ${i}:`, error);
        }
      }

      return allMusicProperties;
    } catch (error) {
      this.logger.error('Failed to get all music properties:', error);
      throw new Error(`Failed to get all music properties: ${error.message}`);
    }
  }

  /**
   * Processes all buttons and gets music properties
   * @param {ElementHandle[]} buttons - Array of button elements
   * @returns {Promise<Object[]>} Array of music properties
   */
  async processAllButtons(buttons) {
    try {
      for (const button of buttons) {
        const buttonText = await button.evaluate(el => el.innerHTML);
        
        await button.evaluate(el => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        
        await this.wait(1000);
        await button.click();
        await this.wait(500);

        const pages = await this.browser.pages();

        await pages[1].bringToFront();
        
        this.logger.success(`Button clicked: ${buttonText}`);
      }

      const pages = await this.browser.pages();
      return this.getAllMusicProperties(pages);
    } catch (error) {
      this.logger.error('Failed to process buttons:', error);
      throw new Error(`Failed to process buttons: ${error.message}`);
    }
  }

  /**
   * Cleans up browser resources
   */
  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.logger.info('Browser resources cleaned up successfully');
      }
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }
}

export async function scrapeMusic(soundName) {
  const processor = new MusicProcessor();
  let results = [];
  let attempts = 0;
  const MAX_ATTEMPTS = 3;
  const PARSING_TIMEOUT = 280000; // 4 минуты таймаут
  
  while (attempts < MAX_ATTEMPTS) {
    try {
      attempts++;
      consola.info(`Attempt #${attempts} of parsing`);
      
      // Создаем промис с таймаутом
      const parsingPromise = (async () => {
        await processor.initialize();
        await processor.wait(1000);
        
        const parseMp3BeastHomePage = new ParseMp3BeastHomePage(soundName, processor.browser, processor.mainPage);
        const {page, browser} = await parseMp3BeastHomePage.parseHomePage();
        processor.setBrowser(browser);
        processor.setMainPage(page);
        
        await processor.mainPage.waitForSelector(CONFIG.selectors.listByButton);
        let allButtons = await processor.getArrayOfButtons();

        await processor.getInnerHtml(allButtons);

        results = await processor.processAllButtons(allButtons);
        
        consola.success('Scraping completed successfully');
        await processor.cleanup();
        return results;
      })();

      // Создаем промис с таймаутом
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Parsing timeout after ${PARSING_TIMEOUT/1000} seconds`));
        }, PARSING_TIMEOUT);
      });

      // Ждем выполнения парсинга или таймаута
      results = await Promise.race([parsingPromise, timeoutPromise]);

      break;  
      
    } catch (error) {
      consola.error(`Attempt #${attempts} failed:`, error);
      
      // Очищаем ресурсы перед следующей попыткой
      try {
        await processor.cleanup();
      } catch (cleanupError) {
        consola.error('Error during cleanup:', cleanupError);
      }
      
      if (attempts === MAX_ATTEMPTS) {
        consola.error('Maximum number of attempts reached');
        throw new Error(`Failed after ${MAX_ATTEMPTS} attempts: ${error.message}`);
      }
      
      // Ждем перед следующей попыткой
      await processor.wait(5000);
    }
  }
  
  return results;
}



