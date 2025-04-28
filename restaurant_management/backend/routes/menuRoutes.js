const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const multer = require('multer');

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/', upload.single('image'), menuController.createMenuItem);
router.get('/', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItem);
router.put('/:id', upload.single('image'), menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);
/*router.post('/orders/:orderId/confirm', restaurantController.confirmOrder);
router.post('/orders/:orderId/reject', restaurantController.rejectOrder);
router.put('/orders/:orderId/status', restaurantController.updateOrderStatus);
router.post('/orders/:orderId/request-confirmation', restaurantOrderController.handleOrderConfirmation);*/


module.exports = router;
