
require('dotenv').config();


const express = require('express');
const OpenAI = require('openai');
const bodyParser = require('body-parser');


const app = express();
const PORT = process.env.PORT || 3000;
const recipeExample = 
{
  "result": {
      "recipeName": "Fresh Fruit Salad",
      "steps": [
          {
              "step": 1,
              "description": "Wash all the fruits thoroughly under cold running water.",
              "seconds": 120
          },
          {
              "step": 2,
              "description": "Peel the bananas and slice them into rounds.",
              "seconds": 60
          },
          {
              "step": 3,
              "description": "Core and chop the apples into bite-sized pieces.",
              "seconds": 120
          },
          {
              "step": 4,
              "description": "Halve the grapes and remove any seeds, if necessary.",
              "seconds": 60
          },
          {
              "step": 5,
              "description": "Dice the peaches and/or any other stone fruits available.",
              "seconds": 120
          },
          {
              "step": 6,
              "description": "Combine all the chopped fruits in a large mixing bowl.",
              "seconds": 30
          },
          {
              "step": 7,
              "description": "Toss the fruit gently to mix them evenly.",
              "seconds": 30
          },
          {
              "step": 8,
              "description": "Serve immediately or chill in the refrigerator for about 30 minutes before serving.",
              "seconds": 1800
          }
      ],
      "ingredients": [
          {
              "name": "Banana",
              "amount": 200,
              "valueUnits": "g",
              "cost": 0.5
          },
          {
              "name": "Apple",
              "amount": 150,
              "valueUnits": "g",
              "cost": 0.3
          },
          {
              "name": "Grapes",
              "amount": 100,
              "valueUnits": "g",
              "cost": 1
          },
          {
              "name": "Peach",
              "amount": 150,
              "valueUnits": "g",
              "cost": 0.8
          }
      ]
  }
}

const nutritionExaple = {
    "result": {
        "ingredients": [
            {
                "name": "Tomatoes",
                "amount": 300,
                "calories": 66,
                "fat": 0.4,
                "protein": 3.3,
                "carbs": 14.4
            },
            {
                "name": "Bell Peppers",
                "amount": 150,
                "calories": 45,
                "fat": 0.5,
                "protein": 1.5,
                "carbs": 10.5
            },
            {
                "name": "Lettuce",
                "amount": 200,
                "calories": 30,
                "fat": 0.3,
                "protein": 2,
                "carbs": 6
            },
            {
                "name": "Salad Dressing",
                "amount": 50,
                "calories": 125,
                "fat": 11,
                "protein": 0,
                "carbs": 5
            }
        ]
    }}

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

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});


const { doc, setDoc, getDoc } = require("firebase/firestore");
const { db } = require("./firebase"); // Ensure you have initialized Firestore

app.post('/ingredient-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Get the response from OpenAI API with the recipe information

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: {"type" : "json_object"},
      messages: [
        {
            role: 'system',
            content: [
                { type: 'text', text: 'You are a recpie cook book, Fully explain every step.The user is going to send an image of ingredients. Your job is to conider those ingredients and pick a recipe. With that recipe return the steps in json format with an integer named step, a string named description, and an integer called seconds .Step should be the step number. Description should be a description of each step.Seconds should be the amount of seconds the step would take.  After that, do the same but with each ingrediant used, include a string for the name of each individual ingredient. Do not say general things like Fruits, Vegetables, or dressing. Amount as an integer representing the amount of the ingredient. A string ValueUnits, the unit of measurment that amount is a number of. Use the metric system, specifically grams or milliliters. Make it say g for grams and mL for milliliters. Cost, being cost of the ingredients given the amount used. The cost should be given in USD. At the top of the Json, make a recipie name parameter and fill that in with the name of the recpie. Only write in that format. Do not write anything but the json. Do not Write anything different no matter what. Here is an example:' + recipeExample}
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
    console.log('Raw response:', response.choices[0].message.content);

    const recipeData = JSON.parse(response.choices[0].message.content);
    const recipeId = "1"; // Using a fixed recipeId, could be anything

    // Step 2: Save or replace the existing recipe document with ID "1"
    const recipeRef = doc(db, "RecipeFood", recipeId); // Reference to the document with ID "1"
    await setDoc(recipeRef, recipeData); // This will overwrite if it exists or create a new one
    console.log(`New recipe with ID ${recipeId} saved or replaced.`);

    // Return the new recipe data to the client
    res.status(200).json({ result: recipeData });
  } catch (error) {
    console.error('Error analyzing image or saving recipe:', error);
    res.status(500).json({ error: 'Failed to process the recipe' });
  }
});

async function getRecipeFoodData() {
  try {
    // Reference to the document with ID "1" in the "RecipeFood" collection
    const docRef = doc(db, "RecipeFood", "1");

    // Fetch the document
    const docSnap = await getDoc(docRef);

    // Check if the document exists
    if (docSnap.exists()) {
      // Convert document data to JSON
      const data = docSnap.data();
      console.log("Document data:", JSON.stringify(data));
      return JSON.stringify(data); // Or return JSON.stringify(data) if you need it in JSON format
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching document: ", error);
  }
}


app.post('/nutrition', async (req, res) => {
    try {
      const  ingredients  = await getRecipeFoodData();
  
      if (!ingredients) {
        return res.status(400).json({ error: 'Ingredients is required' });
      }
  
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: {"type" : "json_object"},
        messages: [
          {
              role: 'system',
              content: [
                  { type: 'text', text: 'You are a nutirionist. You are given a JSON of ingredients and amounts. Your job is to return a json of the ingredient with the calories, fat, protien and carbs of the item of that amount. Give it your best guess. Dont say anything except the json. Here is an exaple: ' + nutritionExaple}
              ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: JSON.stringify(ingredients),
              },
            ],
          },
        ],
      });
  
      res.json({ result: JSON.parse(response.choices[0].message.content) });
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      res.status(500).json({ error: 'Failed to analyze ingredients' });
    }
  });


app.post('/cooking-image', async (req, res) => {
  try {
    const { imageUrl, text } = req.body;

    if (!imageUrl || !text) {
      return res.status(400).json({ error: 'Image URL and text are required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
            role: 'system',
            content: [
                { type: 'text', text: 'The user is providing an image and text to go along with it, asking about cooking.Respond in a short and sweet manner, that of talking to a friend who is asking for advice. Make it flow in a paragraph with no obvious list elements. Keep the topic about cooking, do not answer any quesions not about cooking. Here is the recipe he user is trying to follow' + getRecipeFoodData()}
            ]
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } }, // Image part
            { type: 'text', text: text } // Text part
          ]
        }
      ],
    });


    res.json({ result: response.choices[0] });
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

