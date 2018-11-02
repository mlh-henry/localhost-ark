'use strict'

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('product', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    imageUrl: DataTypes.STRING,
    code: {
      type: DataTypes.STRING,
      unique: true
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {})

  return { Product }
}
