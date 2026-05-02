const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          ...messages
        ],
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
        }
      }
    );
    const text = response.data.choices[0].message.content;
    res.json({ content: [{ text }] });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'API call failed' });
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on port 3001');
});
