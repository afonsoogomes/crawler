import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer'
import moment from 'moment'
import locateChrome from 'locate-chrome'
import { CategoryDataType, PlanDataType } from './types'
import { CategoryModel, PlanModel, PlanItemModel } from './database/models'
import database from './database/instance'

export default class Crawler {
  /**
   * URL base para acessar as páginas.
   * @type {string}
   */
  private baseUrl: string = 'https://www.bpsaude.com.br'

  /**
   * Propriedade que informa se o script está sendo executado.
   * @type {boolean}
   */
  public running: boolean = false

  /**
   * Instância do navegador.
   * @type {Browser | undefined}
   */
  private browser: Browser | undefined

  /**
   * Instância da página principal.
   * @type {Page | undefined}
   */
  private mainPage: Page | undefined

  /**
   * Instância da página do plano.
   * @type {Page | undefined}
   */
  private planPage: Page | undefined

  /**
   * Função para abrir o navegador e retornar a página atual.
   * @returns {Promise<void>}
   */
  private openBrowser = async (): Promise<void> => {
    try {
      this.running = true

      this.browser = await puppeteer.launch({
        executablePath: await locateChrome() as string,
        headless: process.env.NODE_ENV === 'production' ? 'new' : false,
        ignoreDefaultArgs: ['--disable-extensions'],
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-features=site-per-process']
      })

      this.mainPage = await this.browser.newPage()
    } catch (error: any) {
      error.message = 'Erro ao abrir navegador'
      throw error
    }
  }

  /**
   * Função para fechar o navegador.
   * @returns {Promise<void>}
   */
  private closeBrowser = async (): Promise<void> => {
    try {
      this.browser?.close()
      this.running = false
    } catch (error: any) {
      error.message = 'Erro ao fechar navegador'
      throw error
    }
  }

  /**
   * Função para retornar o conteúdo da tag TD.
   * @param {ElementHandle | null} tableElement - Elemento que contém a tag Table.
   * @param {string} columnName - Descrição da coluna.
   * @returns {Promise<number | null>} Retorna o índice da tag TH em relação a tag TR.
   */
  private getThIndex = async (tableElement: ElementHandle | null, columnName: string): Promise<number | null> => {
    try {
      const thElements = await tableElement?.$$('table thead tr th') ?? []

      for await (const [index, th] of thElements.entries()) {
        const thText = await th.evaluate(element => element.textContent.trim())
        if (thText === columnName) {
          return index + 1
        }
      }

      return null
    } catch (error: any) {
      error.message = 'Erro ao pegar índice da tag TH'
      throw error
    }
  }

  /**
   * Função para retornar o conteúdo da tag TD.
   * @param {ElementHandle | null} tableElement - Elemento que contém a tag Table.
   * @param {number} rowIndex - Índice da tr .
   * @param {string} columnName - Descrição da coluna.
   * @returns {Promise<string | null>} Retorna o texto da tag TD.
   */
  private getTableData = async (tableElement: ElementHandle | null, rowIndex: number, columnName: string): Promise<string | null> => {
    try {
      const columnIndex = await this.getThIndex(tableElement, columnName)

      if (!columnIndex) {
        return null
      }

      const column = await tableElement?.$(`tbody tr:nth-child(${rowIndex}) td:nth-child(${columnIndex})`)
      const textContent = await column?.evaluate(a => a.textContent)
      return textContent ?? null
    } catch (error: any) {
      error.message = 'Erro ao pegar dados da tag TD'
      throw error
    }
  }

  /**
   * Função para ir para página principal.
   * @returns {Promise<void>}
   */
  private goToMainPage = async (): Promise<void> => {
    try {
      await this.mainPage?.goto(`${this.baseUrl}/Transparencia`)
      await this.mainPage?.waitForNetworkIdle()
    } catch (error: any) {
      error.message = 'Erro ao navegar para página principal'
      throw error
    }
  }

  /**
   * Função para buscar o cliente de teste.
   * @returns {Promise<void>}
   */
  private searchOrganization = async (): Promise<void> => {
    try {
      await this.mainPage?.type('#input-pesquisa-orgao', 'cliente de testes')
      await this.mainPage?.keyboard.press('Enter')
      await this.mainPage?.waitForSelector('#result-pesquisa table')
    } catch (error: any) {
      error.message = 'Erro ao buscar organização'
      throw error
    }
  }

  /**
   * Função para abrir a página de detalhes da organização.
   * @returns {Promise<void>}
   */
  private goToOrganizationPage = async (): Promise<void> => {
    try {
      const anchorTag = await this.mainPage?.$('#result-pesquisa table tbody tr > td:last-of-type a')
      await anchorTag?.click()
      await this.mainPage?.waitForNavigation()
    } catch (error: any) {
      error.message = 'Erro ao navegar para página da organização'
      throw error
    }
  }

  /**
   * Função para buscar os dados detalhados de cada plano.
   * @returns {Promise<void>}
   */
  private crawPlans = async (): Promise<void> => {
    try {
      const table = await this.mainPage?.$('#result-pesquisa table') ?? null
      const rows = await this.mainPage?.$$('#result-pesquisa table tbody tr') ?? []

      for await (const [index, row] of rows.entries()) {
        const linkTag = await row?.$('td:last-of-type a')
        const planPageUrl = await linkTag?.evaluate(element => element.getAttribute('href'))
        const year = await this.getTableData(table, index + 1, 'Ano')
        const status = await this.getTableData(table, index + 1, 'Status')
        const name = await this.getTableData(table, index + 1, 'Identificação')
        const estimatedBudget = await this.getTableData(table, index + 1, 'Valor do Orçamento estimado para o Exercício')

        this.planPage = await this.browser?.newPage()
        await this.planPage?.goto(`${this.baseUrl}${planPageUrl}`)
        await this.planPage?.waitForNetworkIdle()

        const where = {
          name
        }

        const values = {
          year: Number(year),
          status: status?.replace(/\n/g, ''),
          estimated_budget: Number(estimatedBudget?.replace('R$ ', '').replace(/\./g, '').replace(',', '.'))
        }

        const [plan, created] = await PlanModel.findOrCreate({ where, defaults: values })

        if (!created) {
          await PlanModel.update(values, { where })
        }

        const element = await this.planPage?.$('xpath///span[text()="Detalhamento do Plano"]')
        if (!element) {
          return
        }

        const list = await element.$('xpath/.//following-sibling::ol')
        if (!list) {
          return
        }

        const listItems = await list.$$(':scope > li')
        for await (const listItem of listItems) {
          const category = await this.fetchCategory(listItem)
          await this.crawItems(listItem, plan, category)
        }

        await this.planPage?.close()
        await this.mainPage?.bringToFront()

        const session = await this.mainPage?.target().createCDPSession();
        await session?.send('Page.enable');
        await session?.send('Page.setWebLifecycleState', {state: 'active'});
      }
    } catch (error: any) {
      error.message = 'Erro ao coletar dados do plano'
      throw error
    }
  }

  /**
   * Função para buscar e armazenar a categoria pelo nome e caso não encontre,
   * será inserido uma nova categoria.
   * @param {ElementHandle} element - Elemento referente a tag LI da categoria.
   * @returns {Promise<CategoryDataType | null>}
   */
  private fetchCategory = async (element: ElementHandle): Promise<CategoryDataType | null> => {
    try {
      const hasCategory = await element.evaluate(a => !a.classList.contains('text-danger'))

      if (!hasCategory) {
        return null
      }

      const categoryLabelElement = await element.$('.list-sticky-item-label > span:first-of-type')
      const categoryName = await categoryLabelElement?.evaluate(a => a.textContent)

      const [category] = await CategoryModel.findOrCreate({
        where: { name: categoryName }
      })

      return category
    } catch (error: any) {
      error.message = 'Erro ao buscar categoria'
      throw error
    }
  }

  /**
   * Função para buscar e armazenar os itens do plano.
   * @param {ElementHandle} element - Elemento referente a tag LI da categoria.
   * @param {PlanDataType} plan - Model do plano.
   * @param {CategoryDataType} category - Model da categoria.
   * @returns {Promise<void>}
   */
  private crawItems = async (element: ElementHandle, plan: PlanDataType, category: CategoryDataType | null): Promise<void> => {
    try {
      const rows = await element?.$$('table tbody tr') ?? []
      const table = await element?.$('table') ?? null

      for await (const [index] of rows.entries()) {
        const uasg = await this.getTableData(table, index + 1, 'UASG')
        const itemNumber = await this.getTableData(table, index + 1, 'Nº Item')
        const itemCode = await this.getTableData(table, index + 1, 'Código do Item')
        const description = await this.getTableData(table, index + 1, 'Descrição')
        const quantity = await this.getTableData(table, index + 1, 'Quantidade')
        const unity = await this.getTableData(table, index + 1, 'Unidade')
        const estimatedTotalValue = await this.getTableData(table, index + 1, 'Valor total estimado (R$)')
        const priorityLevel = await this.getTableData(table, index + 1, 'Grau de prioridade')
        const desiredDate = await this.getTableData(table, index + 1, 'Data desejada')

        const where = {
          plan_id: plan.id,
          category_id: category?.id ?? null,
          uasg: Number(uasg?.replace(/\D/, '')) || null,
          item_number: Number(itemNumber?.replace(/\D/, '')) || null,
          item_code: Number(itemCode?.replace(/\D/, '')) || null,
        }

        const values = {
          description: description as string,
          quantity: Number(quantity?.replace(/\D/, '')),
          unity: unity as string,
          estimated_total_value: Number(estimatedTotalValue?.replace(/\./g, '').replace(',', '.')),
          priority_level: priorityLevel as string,
          desired_date: moment(desiredDate, 'DD/MM/YYYY').toDate()
        }

        const { 1: created } = await PlanItemModel.findOrCreate({ where, defaults: values })

        if (!created) {
          await PlanItemModel.update(values, { where })
        }
      }

      const nextPageElement = await element?.$('.paginacao ul li.PagedList-skipToNext')
      const isNextPageDisabled = !nextPageElement || await nextPageElement?.evaluate(a => a.classList.contains('disabled'))

      if (!isNextPageDisabled) {
        await nextPageElement.click()

        await this.planPage?.bringToFront()
        const session = await this.planPage?.target().createCDPSession();
        await session?.send('Page.enable');
        await session?.send('Page.setWebLifecycleState', {state: 'active'});

        await this.planPage?.waitForNetworkIdle()
        await this.crawItems(element, plan, category)
      }
    } catch (error: any) {
      error.message = 'Erro ao coletar dados dos itens do plano'
      throw error
    }
  }

  /**
   * Função para iniciar o script crawler.
   * @returns {Promise<void>}
   */
  public startCrawler = async (): Promise<void> => {
    const transaction = await database.transaction()

    try {
      console.log('Crawler iniciado')

      await this.openBrowser()
      await this.goToMainPage()
      await this.searchOrganization()
      await this.goToOrganizationPage()
      await this.crawPlans()
      await this.closeBrowser()

      transaction.commit()
      console.log('Crawler finalizado')
    } catch (error) {
      // Aqui pode ser disparado notificações, email, sms e até integrado com algumas plataformas de monitoramento
      // como por exemplo: datadog, sentry, new relic...
      transaction.rollback()
      this.browser?.close()
      console.log(error)
    }
  }
}
