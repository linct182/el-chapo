module.exports = (sequelize, DataTypes) => {
  const products = sequelize.define('products', {
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  products.associate = (models) => {
    products.belongsTo(models.product_types, {
      foreignKey: 'type_id',
      onDelete: 'CASCADE',
    });
  };

  return products;
};