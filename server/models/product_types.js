module.exports = (sequelize, DataTypes) => {
  const product_types = sequelize.define('product_types', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  product_types.associate = (models) => {
    product_types.hasMany(models.products, {
      foreignKey: 'type_id',
      as: 'products',
    });
  };

  return product_types;
};