const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateMyProfile,
  addAddress,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.put('/me/profile', updateMyProfile);
router.post('/me/addresses', addAddress);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
