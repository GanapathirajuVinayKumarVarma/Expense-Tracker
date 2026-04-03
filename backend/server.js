const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Database Setup using JSON
const dataFile = path.join(__dirname, 'expenses.json');
let db = { categories: [], expenses: [] };

// Helper to save DB to file
function saveDB() {
    fs.writeFileSync(dataFile, JSON.stringify(db, null, 4));
}

// Generate new ID
function getNewId(table) {
    if (table.length === 0) return 1;
    return Math.max(...table.map(item => item.id)) + 1;
}

// Load existing data or initialize
if (fs.existsSync(dataFile)) {
    try {
        db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        console.log("Connected to the JSON database.");
    } catch (e) {
        console.error("Error reading database file, starting fresh", e);
    }
} else {
    console.log('Creating new JSON database.');
    // Insert default categories
    db.categories = [
        { id: 1, name: "Food" },
        { id: 2, name: "Entertainment" },
        { id: 3, name: "Household Expenses" }
    ];
    saveDB();
}

// Routes

// Get all categories
app.get('/categories', (req, res) => {
    res.json(db.categories);
});

// Add new category
app.post('/categories', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ "error": "Name is required" });
    }
    
    // Check if category already exists
    if (db.categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ "error": "Category already exists" });
    }

    const newCategory = {
        id: getNewId(db.categories),
        name: name
    };
    db.categories.push(newCategory);
    saveDB();
    
    res.json(newCategory);
});

// Get all expenses
app.get('/expenses', (req, res) => {
    // Sort by date descending
    const sortedExpenses = [...db.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sortedExpenses);
});

// Add new expense
app.post('/expenses', (req, res) => {
    const { category_id, category_name, reason, amount, date } = req.body;
    
    if (amount < 0) {
        return res.status(400).json({ "error": "Amount cannot be negative" });
    }

    const newExpense = {
        id: getNewId(db.expenses),
        category_id: parseInt(category_id),
        category_name: category_name,
        reason: reason,
        amount: parseFloat(amount),
        date: date || new Date().toISOString()
    };
    
    db.expenses.push(newExpense);
    saveDB();
    
    res.json(newExpense);
});

// Update an expense
app.put('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const { category_id, category_name, reason, amount, date } = req.body;

    if (amount < 0) {
        return res.status(400).json({ "error": "Amount cannot be negative" });
    }

    const expenseIndex = db.expenses.findIndex(e => e.id === parseInt(id));
    if (expenseIndex === -1) {
        return res.status(404).json({ "error": "Expense not found" });
    }

    const expense = db.expenses[expenseIndex];
    
    expense.category_id = category_id !== undefined ? parseInt(category_id) : expense.category_id;
    expense.category_name = category_name !== undefined ? category_name : expense.category_name;
    expense.reason = reason !== undefined ? reason : expense.reason;
    expense.amount = amount !== undefined ? parseFloat(amount) : expense.amount;
    expense.date = date !== undefined ? date : expense.date;

    saveDB();

    res.json({ message: "success", changes: 1 });
});

// Delete specific category and its expenses
app.delete('/categories/:id', (req, res) => {
    const { id } = req.params;
    const catId = parseInt(id);
    
    console.log(`Received request to delete category ${id}`);

    if (!id) {
        return res.status(400).json({ "error": "ID is required" });
    }

    // Delete associated expenses first
    db.expenses = db.expenses.filter(e => e.category_id !== catId);
    
    // Delete the category
    const initialCategoryCount = db.categories.length;
    db.categories = db.categories.filter(c => c.id !== catId);

    if (db.categories.length === initialCategoryCount) {
        return res.status(404).json({ "error": "Category not found" });
    }

    saveDB();
    
    console.log(`Successfully deleted category ${id}`);
    res.json({ "message": "category deleted", changes: 1 });
});

// Delete specific expense
app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const expId = parseInt(id);
    
    const initialCount = db.expenses.length;
    db.expenses = db.expenses.filter(e => e.id !== expId);

    if (db.expenses.length === initialCount) {
        return res.status(404).json({ "error": "Expense not found" });
    }

    saveDB();
    res.json({ "message": "deleted", changes: 1 });
});

// Delete all expenses
app.delete('/expenses', (req, res) => {
    db.expenses = [];
    saveDB();
    res.json({ "message": "all deleted", changes: 1 });
});

// Route to download the database file
app.get('/expenses.json', (req, res) => {
    res.download(dataFile, 'expenses.json', (err) => {
        if (err) {
            console.error("Error downloading database file:", err.message);
            res.status(500).send("Error downloading file");
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
