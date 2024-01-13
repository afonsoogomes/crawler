import Crawler from './crawler'
import cron from 'node-cron'

const crawler = new Crawler()
crawler.startCrawler()

cron.schedule('*/5 * * * *', () => {
  if (!crawler.running) {
    crawler.startCrawler()
  }
})
