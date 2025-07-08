import { create } from "./userModel"

const mongoose = required('mongoose')

const ticketSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.types.objectID,
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
                createAt: {
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