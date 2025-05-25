import { CONFIG } from '../../../config/parserMp3BeastConfig.js';

export default class ParseMp3BeastHomePage {
    constructor(musicName, browser, page) {
        this.musicName = musicName;
        this.browser = browser;
        this.page = page;
    }   

    async openHomePage() {
        try {
            await this.page.goto(CONFIG.url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            await this.page.waitForSelector(CONFIG.selectors.searchInput);
            await this.page.type(CONFIG.selectors.searchInput, this.musicName);
            await this.page.keyboard.press('Enter');

            return {page: this.page, browser: this.browser};
        } catch (error) {
            console.error('Ошибка при открытии домашней страницы(mp3beast):', error);
            throw error;
        }
    }

    async parseHomePage() {
        try {
            const result = await this.openHomePage();
            if (!result) {
                throw new Error('Failed to open home page');
            }
            return result;
        } catch (error) {
            console.error('Ошибка при запуске парсинга домашней страницы(mp3beast):', error);
            throw error;
        }
    }
}