import Crawler from './crawler'
import cron from 'node-cron'

const crawler = new Crawler()
crawler.startCrawler()

cron.schedule('*/30 * * * *', () => {
  if (!crawler.running) {
    crawler.startCrawler()
  }
})
