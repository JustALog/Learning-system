const express = require('express');
const { sectionSchema, updateSectionSchema } = require('../validations/section.validation');
const { validate } = require('../middleware/validate');
const sectionController = require('../controllers/section.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// GET /api/sections
router.get('/', sectionController.getAll);

// GET /api/sections/:id
router.get('/:id', sectionController.getById);

// POST /api/sections
router.post('/', sectionSchema, validate, sectionController.create);

// PUT /api/sections/:id
router.put('/:id', updateSectionSchema, validate, sectionController.update);

// DELETE /api/sections/:id
router.delete('/:id', sectionController.delete);

module.exports = router;
