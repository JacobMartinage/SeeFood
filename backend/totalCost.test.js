const totalCost = require('./index.js');


describe('totalCost', () => {
    it('should calculate the total cost of ingredients correctly', () => {
      const jsonData = {
        "ingredients": [
          { "name": "Apples", "amount": 200, "ValueUnits": "g", "cost": 0.6 },
          { "name": "Oranges", "amount": 200, "ValueUnits": "g", "cost": 0.4 },
          { "name": "Lettuce", "amount": 100, "ValueUnits": "g", "cost": 0.5 },
          { "name": "Any dressings", "amount": 30, "ValueUnits": "mL", "cost": 0.5 }
        ]
      };
  
      const result = totalCost(jsonData);
      expect(result).toBe(2.0); // The expected total cost is 2.0
    });
  });