import { QueryInterface, DataTypes } from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('categories', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    })
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('categories')
  }
}
