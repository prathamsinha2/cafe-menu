// server/routes/menu.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Item = require('../models/item');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Route to GET all menu items
router.get('/', async (req, res) => {
    try {
      const items = await Item.find();
      res.json(items);
    } catch (error) {
        res.status(500).json({ message: "error fetching menu items", error})
    }
});

// Route to POST a new menu item - Protected route only manager can access with valid JWT
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating menu item', error });
  }
});


// Route to PUT update an existing menu item - Protected route
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if(!updatedItem) {
           return res.status(404).json({ message: "Item not found"})
        }
        res.json(updatedItem)
    } catch (error) {
        res.status(500).json({ message: "Error updating menu item", error})
    }
})

// Route to DELETE an existing menu item - Protected route
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if(!deletedItem){
           return res.status(404).json({ message: "Item not found"});
        }
        res.json({message: 'Item deleted succesfully'})
    } catch (error) {
        res.status(500).json({ message: "Error deleting menu item", error});
    }
})

module.exports = router;