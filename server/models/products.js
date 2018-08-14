module.exports = (sequelize, DataTypes) => {
  const products = sequelize.define('products', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
    promo_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sale_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
    is_sale: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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