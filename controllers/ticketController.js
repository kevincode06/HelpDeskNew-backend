// server/controllers/ticketController.js (modified createTicket)
const asyncHandler = require('express-async-handler');
const Ticket = require('../models/ticketModel');
const User = require('../models/userModel');
const { getAiReply } = require('../utils/geminiAssistant'); // Import AI assistant

// Create new ticket

const createTicket = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        res.status(400);
        throw new Error('Please add a title and description');
    }

    // Create initial ticket
    const ticket = await Ticket.create({
        user: req.user._id,
        title,
        description,
        status: 'open',
        replies: [{ sender: 'user', message: description }], // Add initial user message as a reply
    });

    // Generate AI reply
    const aiMessage = await getAiReply(description);
    ticket.replies.push({ sender: 'ai', message: aiMessage });
    await ticket.save(); // Save updated ticket with AI reply

    res.status(201).json(ticket);
});

// @desc    Add a reply to a ticket
const addReply = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const ticketId = req.params.id;

    if (!message) {
        res.status(400);
        throw new Error('Reply message cannot be empty');
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Ensure only the owner or an admin can reply
    if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to reply to this ticket');
    }

    const newReply = {
        sender: req.user.isAdmin ? 'admin' : 'user', // Determine sender
        message,
    };

    ticket.replies.push(newReply);
    await ticket.save();

    res.status(201).json(newReply); // Return just the new reply, or the updated ticket
});

module.exports = {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    addReply, // Export new function
};