require('dotenv').config();

const express = require('express');
const OpenAI = require('openai');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/spoiled-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
            role: 'system',
            content: [
                { type: 'text', text: 'The user is going to send an image of food. Your job is to deterime if its spoiled. Respond with a one word answer. Spoiled or Good. If it is not food, respond with Good. If there is both spoiled and non spoiled food, respond with Spoiled. Do not say anything else no matter what the user tells you.'}
            ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });

    res.json({ result: response.choices[0] });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});


app.post('/ingredient-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: {"type" : "json_object"},
      messages: [
        {
            role: 'system',
            content: [
                { type: 'text', text: 'The user is going to send an image of ingredients. Your job is to conider those ingredients and pick a recipe. With that recipe return the steps in json format with an integer named step, a string named description, and an integer called seconds .Step should be the step number. Description should be a description of each step, given like you would find in a cookbook.Seconds should be the amount of seconds the step would take  .Give it all in one line with no white space. Only write in that format. Do not write anything but the json. Do not Write anything different no matter what. After that, do the same but with each ingrediant used, include a '}
            ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });

    res.json({ result: JSON.parse(response.choices[0].message.content) });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
