// server/utils/geminiAssistant.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const getAiReply = async (ticketDescription) => {
    try {
        const prompt = `You are an AI customer support assistant. Provide a concise and helpful initial reply to the following support ticket description. Do not ask for personal information.

        Ticket Description: "${ticketDescription}"

        AI Assistant Reply:`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error('Error getting AI reply from Gemini:', error);
        return 'Thank you for your submission. We have received your ticket and will get back to you shortly.';
    }
};

module.exports = { getAiReply };

// OsZAoB8h7nzO4M4r