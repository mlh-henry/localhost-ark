module.exports = model => {
  if (
    model._modelOptions.name.singular === 'product' ||
    model._modelOptions.name.plural === 'products'
  ) {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      imageUrl: model.imageUrl,
      code: model.code,
      price: model.price,
      quantity: model.quantity
    };
  }
};
