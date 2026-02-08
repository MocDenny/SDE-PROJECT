const unitConversionMap = {
    volume: {
        tbsp: 1,
        tbsps: 1,
        tbs: 1,
        tsp: 1 / 3,
        cup: 16,
        cups: 16,
        c: 16,
        handful: 4,
        pinch: 1 / 16,
        ml: 0.0676,
    },
    weight: {
        kg: 1000,
        g: 1,
        oz: 28.35,
        ozs: 28.35,
        lb: 453.59,
        lbs: 453.59,
        pound: 453.59,
        pounds: 453.59,
    },
    other: {
        "": 1, // for unitless ingredients like "2 eggs",
        clove: 1,
        cloves: 1,
        serving: 1,
        servings: 1,
        small: 1,
        pkg: 1,
        pkgs: 1,
        drops: 1,
        drop: 1,
        pinch: 1,
        large: 1,
        slice: 1,
        slices: 1,
        bottle: 1,
        bottles: 1,
    },
};

const getUnitType = (unit) => {
    if (unit in unitConversionMap.volume) return "volume";
    if (unit in unitConversionMap.weight) return "weight";
    if (unit in unitConversionMap.other) return "other";
    return null; // Unknown unit
};

const convertUnit = (amount, fromUnit, toUnit) => {
    fromUnit = fromUnit.toLowerCase();
    toUnit = toUnit.toLowerCase();
    const fromType = getUnitType(fromUnit);
    const toType = getUnitType(toUnit);

    if (!fromType || !toType || fromType !== toType) {
        console.warn(
            `Cannot convert between incompatible or unknown units: ${fromUnit} -> ${toUnit}`,
        );
        return null; // Conversion not possible
    }

    const fromFactor = unitConversionMap[fromType][fromUnit];
    const toFactor = unitConversionMap[toType][toUnit];

    return (amount * fromFactor) / toFactor;
};

/**
 * @swagger
 * tags:
 *   - name: Grocery List Management
 *     description: Endpoints for creating and managing grocery lists
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       description: Object representing a recipe
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the recipe
 *         type:
 *           type: string
 *           description: Type of the recipe (e.g., breakfast, lunch, etc.)
 *         calories:
 *           type: number
 *           description: Calories in the recipe
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             description: Ingredient object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the ingredient
 *               aisle:
 *                 type: string
 *                 description: Aisle where the ingredient can be found in the store
 *               amount:
 *                 type: number
 *                 description: Amount of the ingredient needed for the recipe
 *               unit:
 *                 type: string
 *                 description: Unit of measurement for the ingredient amount
 *     GroceryList:
 *       type: object
 *       description: Object representing an optimized grocery list
 *       properties:
 *         aisle1Name:
 *           type: array
 *           description: Array of the products in the aisle
 *           items:
 *             type: object
 *             description: Ingredient object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the ingredient
 *               amount:
 *                 type: number
 *                 description: Total amount of the ingredient needed across all recipes
 *               unit:
 *                 type: string
 *                 description: Unit of measurement for the ingredient amount
 *               aisle:
 *                 type: string
 *                 description: Aisle where the ingredient can be found in the store
 *         aisle2Name:
 *           type: array
 *           description: Array of the products in the aisle
 *           items:
 *             type: object
 *             description: Ingredient object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the ingredient
 *               amount:
 *                 type: number
 *                 description: Total amount of the ingredient needed across all recipes
 *               unit:
 *                 type: string
 *                 description: Unit of measurement for the ingredient amount
 *               aisle:
 *                 type: string
 *                 description: Aisle where the ingredient can be found in the store
 */

/**
 * @swagger
 * /optimizeList:
 *   post:
 *     tags:
 *      - Grocery List Management
 *     summary: Optimize grocery list
 *     description: This endppoint takes a list of recipes and optimizes the grocery list by aggregating ingredients and grouping them by aisle.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipes:
 *                 type: array
 *                 description: List of recipes to optimize the grocery list for
 *                 items:
 *                   $ref: '#/components/schemas/Recipe'
 *     responses:
 *       200:
 *         description: Grocery list optimized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroceryList'
 *       400:
 *         description: Bad request, missing parameters
 *       500:
 *         description: Service error
 */

const optimize_grocery_list = async function (req, res) {
    console.log("Called POST /optimizeList");

    // error handling
    if (!req.body.recipes) {
        return res.status(400).json("Error: Request body is empty or incomplete");
    }

    console.log("Parameters received: " + req.body.recipes);

    const recipes = req.body.recipes;

    if (!recipes.length) {
        return res.status(400).json("Error: No recipes provided");
    }

    // Extract and aggregate ingredients
    const ingredientMap = {};

    recipes.forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
            const key = ingredient.name.toLowerCase();

            if (!ingredientMap[key]) {
                ingredientMap[key] = {
                    amount: 0,
                    unit: ingredient.unit,
                    name: ingredient.name,
                    aisle: ingredient.aisle,
                };
            }

            const convertedAmount = convertUnit(
                ingredient.amount,
                ingredient.unit,
                ingredientMap[key].unit,
            );

            if (convertedAmount !== null) {
                ingredientMap[key].amount += convertedAmount;
                console.log(
                    "Aggregating ingredient: " + ingredient.name + ", amount: " + convertedAmount,
                );
            } else {
                console.warn(
                    `Unit mismatch for ${ingredient.name}: ${ingredientMap[key].unit} vs ${ingredient.unit}, skipping aggregation`,
                );
            }
        });
    });

    // Convert the map to an array
    const optimizedList = Object.values(ingredientMap);

    // Group ingredients by aisle
    const groupedByAisle = optimizedList.reduce((acc, ingredient) => {
        const aisle = ingredient.aisle || "Other";
        if (!acc[aisle]) {
            acc[aisle] = [];
        }
        acc[aisle].push(ingredient);
        return acc;
    }, {});

    //console.log("Optimized grocery list: " + JSON.stringify(groupedByAisle));

    return res.status(200).json(groupedByAisle);
};

module.exports = { optimize_grocery_list };
