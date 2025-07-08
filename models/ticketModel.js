
const mongoose = require('mongoose')

const ticketSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true, 
            ref: 'User', // ref to the model user
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        status: {
            type: String,
            enum: ['open', 'pending', 'closed'],
            default: 'open',
        },
        replies: [
            {
                sender: {
                    type: String,
                    required: true,
                },
                message: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Ticket', ticketSchema);