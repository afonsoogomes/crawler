import { QueryInterface, DataTypes } from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('plan_items', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'plans',
          key: 'id'
        }
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        }
      },
      uasg: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      item_number: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      item_code: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      unity: {
        type: DataTypes.STRING,
        allowNull: false
      },
      estimated_total_value: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      priority_level: {
        type: DataTypes.STRING,
        allowNull: false
      },
      desired_date: {
        type: DataTypes.DATE,
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
    await queryInterface.dropTable('plan_items')
  }
}
