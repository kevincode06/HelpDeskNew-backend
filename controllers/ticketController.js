const asyncHandler = require('express-async-handler');
const Ticket = require('../models/ticketModel');
const User = require('../models/userModel'); // To verify user 
const { getAiReply } = require('../utils/geminiAssistant'); // Import AI assistant

// Create new ticket

const createTicket = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // Validate request body
    if (!title || !description) {
        res.status(400);
        throw new Error('Please add a title and description');
    }

    // Create initial ticket with the user's first message
    const ticket = await Ticket.create({
        user: req.user._id, // Associate ticket with the logged-in user
        title,
        description,
        status: 'open', // Initial status is 'open'
        replies: [{ sender: 'user', message: description }], // Add the user's initial message as the first reply
    });

    // Generate an automatic AI reply for the newly created ticket
    const aiMessage = await getAiReply(description);

    // Add the AI's reply to the ticket's replies array
    ticket.replies.push({ sender: 'ai', message: aiMessage });

    // Save the ticket with the added AI reply to the database
    await ticket.save();

    // Respond with the newly created ticket, now including the AI's initial reply
    res.status(201).json(ticket);
});

// Get all tickets for a specific user

const getTickets = asyncHandler(async (req, res) => {
    // Find all tickets associated with the logged-in user
    const tickets = await Ticket.find({ user: req.user._id })
        .sort('-createdAt'); // Sort by creation date, newest first
    res.status(200).json(tickets);
});

// Get a single ticket by ID
const getTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    // Check if the ticket exists
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Ensure the logged-in user is the owner of the ticket
    if (ticket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to view this ticket');
    }

    res.status(200).json(ticket);
});

// Update ticket status (primarily for user to close their own ticket)

const updateTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    // Check if the ticket exists
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Ensure the logged-in user is the owner of the ticket
    if (ticket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this ticket');
    }

    // Update the ticket's status based on the request body
    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status }, // Assuming req.body.status is 'closed' or other valid user-updatable status
        { new: true } // Return the updated document
    );

    res.status(200).json(updatedTicket);
});

// Add a reply to a ticket
const addReply = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const ticketId = req.params.id;

    // Validate reply message
    if (!message) {
        res.status(400);
        throw new Error('Reply message cannot be empty');
    }

    const ticket = await Ticket.findById(ticketId);

    // Check if the ticket exists
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Ensure only the ticket owner or an admin can add a reply
    if (ticket.user.toString() !== req.user.id && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to reply to this ticket');
    }

    // Determine the sender of the reply (user or admin)
    const newReply = {
        sender: req.user.isAdmin ? 'admin' : 'user',
        message,
    };

    // Add the new reply to the ticket's replies array
    ticket.replies.push(newReply);

    // If a user sends a message containing 'support' and they are not an admin,
    if (!req.user.isAdmin && message.toLowerCase().includes('support')) {
        ticket.status = 'pending';
    }

    // Save the updated ticket
    await ticket.save();

    // Respond with the newly added reply (or the updated ticket if preferred)
    res.status(201).json(newReply);
});

// Get all tickets (for admin dashboard)
const getAllTickets = asyncHandler(async (req, res) => {
    // Find all tickets and populate the 'user' field to get user details
    const tickets = await Ticket.find()
        .sort('-createdAt') // Sort by creation date, newest first
        .populate('user', 'name email'); // Populate user's name and email
    res.status(200).json(tickets);
});

// Update ticket status (for admin)
const updateTicketStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const ticketId = req.params.id;

    // Validate the provided status
    if (!status || !['open', 'pending', 'closed'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status provided');
    }

    const ticket = await Ticket.findById(ticketId);

    // Check if the ticket exists
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Update the ticket's status
    ticket.status = status;
    await ticket.save();

    res.status(200).json(ticket);
});

module.exports = {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    addReply,
    getAllTickets, 
    updateTicketStatus, 
};