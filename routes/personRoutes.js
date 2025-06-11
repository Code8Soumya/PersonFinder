const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

// Add a new person
router.post('/add', personController.addPerson);

// Find a person by photo
router.post('/find', personController.findPerson);

// Get all persons
router.get('/', personController.getAllPersons);

module.exports = router;