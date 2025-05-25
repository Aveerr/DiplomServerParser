import e from 'express';
import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import ParseMp3BeastHomePage from './parseMp3BeastHomePage.js';
import { CONFIG } from '../../../config/parserMp3BeastConfig.js';



class MusicProcessor {
  constructor() {
    this.browser = null;
    this.mainPage = null;
    this.counter = 0;
    this.processedItems = [];
  }

  setBrowser(browser){
    this.browser = browser;
  }

  setMainPage(mainPage){
    this.mainPage = mainPage;
  }

  async blockUnnecessaryResources(page){
    page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
          request.abort();
        } else {
          request.continue();
        }
      });
  }
  // Запускаем браузер и создаем новую страницу
  async initialize() {
    try {
      this.browser = await puppeteer.launch(CONFIG.browserOptions);
      this.mainPage = await this.browser.newPage();
      await this.blockUnnecessaryResources(this.mainPage);
    

      await this.mainPage.setUserAgent(CONFIG.userAgent);
      console.log('Browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  // Выводим HTML содержимое элемента
  async showInnerHtml(ElementHandle){
    try {
      if (!ElementHandle) {
        console.log('No elements to show inner HTML for');
        return;
      }
      
      if(Array.isArray(ElementHandle) && ElementHandle.length > 0){
        let arrayInnerHtml = [];
        for(const item of ElementHandle){
          const innerHtml = await item.evaluate(el => el.innerHTML);
          arrayInnerHtml.push(innerHtml);
        }
        console.log({arrayInnerHtml}); 
      } else if (!Array.isArray(ElementHandle)) {
        const innerHtml = await ElementHandle.evaluate(el => el.innerHTML);
        console.log({innerHtml}); 
      }
    } catch (error) {
      console.error('Ошибка при получении innerHTML:', error);
    }
  }

  // Находим кнопки списка на странице
  async getButtons() {
    try {
      const getButtons = await this.mainPage.$$(CONFIG.selectors.listByButton);
      if (!getButtons || getButtons.length === 0) {
        console.log('No buttons found on the page');
        return [];
      }
      console.log(`Found ${getButtons.length} list by button`);
      return getButtons;
    } catch (error) {
      console.error('Ошибка при нахождении кнопок списка:', error);
      return [];
    }
  }

  async getMusicProperties(page){
    try{
      let musciName = await page.$eval(CONFIG.selectors.songTitle, e => e.textContent);
      let musicDownload = await page.$eval(CONFIG.selectors.script, e => e.innerHTML);
      musicDownload = musicDownload.match(CONFIG.regex.musicDownload);
      await page.close();
      return {musciName, musicDownload: musicDownload[0]};
    } catch (error) {
      console.error('Ошибка в функции getMusicProperties');
    }
  }

  async getAllMusicProperties(pages){
    try{
      let counter = 0;
      let allMusicProperties = [];
      for(const page of pages){
        try{
          counter++;
          if(counter >= 2){
            let musicProperties = await this.getMusicProperties(page);
            musicProperties.page = counter-2;
            allMusicProperties.push(musicProperties);
          }
        } catch (error) {
          console.error(`Ошбки при получении свойств музыки ${counter}:`, error);
        }
      }
      return allMusicProperties;
    } catch (error) {
      console.error('Ошибка в функции getAllMusicProperties');
    }
  }

  async processAllButtons(getButtons){
    try{
      let counter = 0;
      let musicName = [];
      for(const item of getButtons){
        counter++;
        let processButton = await item.evaluate(el => el.innerHTML);
        
        // Прокручиваем до элемента перед кликом
        await item.evaluate(el => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        
        // Уменьшаем время ожидания после прокрутки
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await item.click();
        // Уменьшаем время ожидания после клика
        await new Promise(resolve => setTimeout(resolve, 500));
        const pages = await this.browser.pages()

        await pages[1].bringToFront();

        console.log('Button clicked: ', processButton, 'Counter: ', counter);
      }
      const pages = await this.browser.pages()
      let allMusicProperties = await this.getAllMusicProperties(pages);
      console.log(allMusicProperties);
      return allMusicProperties;
    } catch (error) {
      console.error('Error processing list by button:', error);
    }
  }

  async cleanup(){
    await this.browser.close();
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
      console.log(`Попытка парсинга #${attempts}`);
      
      // Создаем промис с таймаутом
      const parsingPromise = (async () => {
        await processor.initialize();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const parseMp3BeastHomePage = new ParseMp3BeastHomePage(soundName, processor.browser, processor.mainPage);
        const {page, browser} = await parseMp3BeastHomePage.parseHomePage();
        processor.setBrowser(browser);
        processor.setMainPage(page);
        
        await processor.mainPage.waitForSelector(CONFIG.selectors.listByButton);
        let getButtons = await processor.getButtons();

        await processor.showInnerHtml(getButtons);

        results = await processor.processAllButtons(getButtons);
        
        console.log('Scraping completed successfully');
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
      
      // Если успешно выполнилось, выходим из цикла
      break;
      
    } catch (error) {
      console.error(`Попытка #${attempts} не удалась:`, error);
      
      // Очищаем ресурсы перед следующей попыткой
      try {
        await processor.cleanup();
      } catch (cleanupError) {
        console.error('Ошибка при очистке ресурсов:', cleanupError);
      }
      
      if (attempts === MAX_ATTEMPTS) {
        console.error('Достигнуто максимальное количество попыток');
        throw new Error(`Failed after ${MAX_ATTEMPTS} attempts: ${error.message}`);
      }
      
      // Ждем перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  return results;
}



