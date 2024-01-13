import instance from '../instance'
import { Model, DataTypes } from 'sequelize'
import { PlanDataType } from '../../types'

const PlanModel = instance.define<Model & PlanDataType>('plans', {
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
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estimated_budget: {
    type: DataTypes.DECIMAL,
    allowNull: false
  }
}, { timestamps: true, underscored: true })

export default PlanModel
