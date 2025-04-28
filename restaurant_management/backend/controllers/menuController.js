const MenuItem = require('../models/menuItem');

// Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { restaurantId, restaurantName, foodName, category, prices } = req.body;
    const imageUrl = req.file ? req.file.path : '';

    const newItem = new MenuItem({
      restaurantId,
      restaurantName,
      foodName,
      category,
      imageUrl,
      prices: JSON.parse(prices) // because prices are sent as JSON string
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all menu items
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single menu item
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { restaurantId, restaurantName, foodName, category, prices } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    const updatedFields = {
      restaurantId,
      restaurantName,
      foodName,
      category,
      prices: JSON.parse(prices)
    };
    if (imageUrl) updatedFields.imageUrl = imageUrl;

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
