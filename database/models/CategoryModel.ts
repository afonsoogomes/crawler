import instance from '../instance'
import { Model, DataTypes } from 'sequelize'
import { CategoryDataType } from '../../types'

const CategoryModel = instance.define<Model & CategoryDataType>('categories', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, { timestamps: true, underscored: true })

export default CategoryModel
