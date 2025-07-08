const express = require('express');
const router = express.Router();
const {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    addReply,
    getAllTickets,
    updateTicketStatus
} = require('../controllers/ticketController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// User routes
router.route('/').post(protect, createTicket).get(protect, getTickets);
router.route('/:id').get(protect, getTicket).put(protect, updateTicket);
router.route('/:id/replies').post(protect, addReply);


// admin routes
router.route('/admin').get(protect, authorizeAdmin, getAllTickets);
router.route('/admin/:id/status').get(protect, authorizeAdmin, updateTicketStatus);
module.exports = router;


