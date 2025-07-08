const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

// Define the User schema
const userSchema =  new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'], 
        },
        email: {
            type: String,
            required: [true, 'Please add an email'], 
            unique: true, 
        },
        password: {
            type: String,
            required: [true, 'Please add a password'], 
        },
        isAdmin: {
            type: Boolean,
            default: false, 
        },
    },
    {
        timestamps: true, 
    }
);

// Middleware to hash the password before saving a new user or updating password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next(); 
    }

    // Generate a salt for hashing
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next(); 
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);