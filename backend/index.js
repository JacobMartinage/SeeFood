require('dotenv').config();

const express = require('express');
const OpenAI = require('openai');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const recipeExample = 
  {
    "result": {
        "steps": [
            {
                "step": 1,
                "description": "Gather all the fresh fruits and vegetables from the fridge, such as apples, oranges, and any leafy greens you have.",
                "seconds": 60
            },
            {
                "step": 2,
                "description": "Wash the fruits and vegetables thoroughly under running water to remove any dirt or pesticides.",
                "seconds": 120
            },
            {
                "step": 3,
                "description": "Chop the fruits and vegetables into bite-sized pieces and place them in a large mixing bowl.",
                "seconds": 180
            },
            {
                "step": 4,
                "description": "If you have any dressings or seasonings, add them to the bowl and toss everything together until well coated.",
                "seconds": 120
            },
            {
                "step": 5,
                "description": "Serve the salad immediately in individual bowls.",
                "seconds": 60
            }
        ],
        "ingredients": [
            {
                "name": "Apples",
                "amount": 200,
                "ValueUnits": "g",
                "cost": 0.6
            },
            {
                "name": "Oranges",
                "amount": 200,
                "ValueUnits": "g",
                "cost": 0.4
            },
            {
                "name": "Lettuce",
                "amount": 100,
                "ValueUnits": "g",
                "cost": 0.5
            },
            {
                "name": "Any dressings",
                "amount": 30,
                "ValueUnits": "mL",
                "cost": 0.5
            }
        ]
    }
}

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
                { type: 'text', text: 'You are a recpie cook book, Fully explain every step.The user is going to send an image of ingredients. Your job is to conider those ingredients and pick a recipe. With that recipe return the steps in json format with an integer named step, a string named description, and an integer called seconds .Step should be the step number. Description should be a description of each step.Seconds should be the amount of seconds the step would take.  After that, do the same but with each ingrediant used, include a string for the name of each individual ingredient. Do not say general things like Fruits, Vegetables, or dressing. Amount as an integer representing the amount of the ingredient. A string ValueUnits, the unit of measurment that amount is a number of. Use the metric system, specifically grams or milliliters. Make it say g for grams and mL for milliliters. Cost, being cost of the ingredients given the amount used. The cost should be given in USD. Only write in that format. Do not write anything but the json. Do not Write anything different no matter what. Here is an example:'}
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

function totalCost(json){

  let sum = 0;

  json.ingredients.forEach(ingredient => {
    sum += ingredient.cost;
  });
  return sum;

}
module.exports = totalCost; 

