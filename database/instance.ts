import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'

dotenv.config()

const instance = new Sequelize({
  logging: false,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  define: {
    timestamps: true,
    underscored: true
  }
})

try {
  instance.authenticate()
  console.log('Conexão com o banco de dados estabelecida com sucesso.')
} catch (error) {
  console.error('Erro ao conectar ao banco de dados:', error)
}

export default instance
