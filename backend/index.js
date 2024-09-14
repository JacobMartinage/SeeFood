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
              "description": "Gather all ingredients and tools needed for the recipe.",
              "seconds": 120
          },
          {
              "step": 2,
              "description": "Wash and prepare the fruits and vegetables. Chop as necessary.",
              "seconds": 300
          },
          {
              "step": 3,
              "description": "Preheat the oven to the required temperature if baking is involved.",
              "seconds": 180
          },
          {
              "step": 4,
              "description": "Mix the ingredients in a bowl, ensuring they're well combined.",
              "seconds": 240
          },
          {
              "step": 5,
              "description": "Transfer the mixture to a baking dish or pan if applicable.",
              "seconds": 60
          },
          {
              "step": 6,
              "description": "Place the dish in the oven and bake for the specified time.",
              "seconds": 1800
          },
          {
              "step": 7,
              "description": "Remove from the oven and let it cool before serving.",
              "seconds": 300
          },
          {
              "step": 8,
              "description": "Serve and enjoy your delicious meal!",
              "seconds": 60
          }
      ],
      "ingredients": [
          {
              "name": "Almond Milk",
              "amount": 500,
              "ValueUnits": "mL",
              "cost": 2,
              "calories": 30,
              "protein": 1,
              "carbs": 5,
              "fat": 1
          },
          {
              "name": "Eggs",
              "amount": 200,
              "ValueUnits": "g",
              "cost": 3,
              "calories": 160,
              "protein": 14,
              "carbs": 1,
              "fat": 10
          },
          {
              "name": "Strawberries",
              "amount": 150,
              "ValueUnits": "g",
              "cost": 2.5,
              "calories": 48,
              "protein": 1,
              "carbs": 11,
              "fat": 0
          },
          {
              "name": "Apples",
              "amount": 300,
              "ValueUnits": "g",
              "cost": 1.5,
              "calories": 156,
              "protein": 1,
              "carbs": 42,
              "fat": 0
          },
          {
              "name": "Lettuce",
              "amount": 100,
              "ValueUnits": "g",
              "cost": 1,
              "calories": 15,
              "protein": 1,
              "carbs": 3,
              "fat": 0
          },
          {
              "name": "Carrots",
              "amount": 200,
              "ValueUnits": "g",
              "cost": 1.2,
              "calories": 82,
              "protein": 2,
              "carbs": 19,
              "fat": 0
          },
          {
              "name": "Cucumbers",
              "amount": 150,
              "ValueUnits": "g",
              "cost": 1.4,
              "calories": 24,
              "protein": 1,
              "carbs": 4,
              "fat": 0
          },
          {
              "name": "Mayonnaise",
              "amount": 100,
              "ValueUnits": "g",
              "cost": 2,
              "calories": 700,
              "protein": 1,
              "carbs": 1,
              "fat": 78
          },
          {
              "name": "Salad Greens",
              "amount": 200,
              "ValueUnits": "g",
              "cost": 1.5,
              "calories": 40,
              "protein": 3,
              "carbs": 8,
              "fat": 1
          },
          {
              "name": "Orange Juice",
              "amount": 250,
              "ValueUnits": "mL",
              "cost": 1,
              "calories": 112,
              "protein": 2,
              "carbs": 26,
              "fat": 0
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
                { type: 'text', text: 'You are a recpie cook book, Fully explain every step.The user is going to send an image of ingredients. Your job is to conider those ingredients and pick a recipe. With that recipe return the steps in json format with an integer named step, a string named description, and an integer called seconds .Step should be the step number. Description should be a description of each step.Seconds should be the amount of seconds the step would take.  After that, do the same but with each ingrediant used, include a string for the name of each individual ingredient. Do not say general things like Fruits, Vegetables, or dressing. Amount as an integer representing the amount of the ingredient. A string ValueUnits, the unit of measurment that amount is a number of. Use the metric system, specifically grams or milliliters. Make it say g for grams and mL for milliliters. Cost, being cost of the ingredients given the amount used. The cost should be given in USD. Calories being  an int representing the amount calories in the serving amount. Protein being an int representing the amount of protein in grams in the servoing amount. Carbs being an int representing the amount of carbs in the serving size in grams. Fat being an int representing the amount of fat in the serving size in grams. Only write in that format. Do not write anything but the json. Do not Write anything different no matter what. Here is an example:'}
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

