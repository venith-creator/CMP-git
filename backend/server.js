const express = require('express');
const cors = require('cors');
/*const fs = require('fs');
const path = require('path');*/
const app = express();
const PORT = process.env.PORT || 3000;

/*const DATA_FILE = path.join(__dirname, 'expenses.json');*/
let expenses = [];

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

/*function loadExpenses(){
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function saveExpenses(expenses) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2));
}*/

app.get('/expenses', (req, res) => {
    try {
        console.log('Get expenses accessed');
        res.json(expenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});

// Add this health check route
app.get('/', (req, res) => {
    console.log('Health check accessed');
    res.json({ 
        message: 'Expense API is running', 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.post('/expenses', (req, res) => {
    /*const expenses = loadExpenses();*/
    try{
        console.log('Post expense accessed', req.body);
        const { desc, amount, category, date } = req.body;
        const newExpense = {
            id: Date.now().toString(),
            desc,
            amount,
            category,
            date
        };
        expenses.push(newExpense);
        /*saveExpenses(expenses);*/
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
app.put('/expenses/:id', (req, res) => {
    /*const expenses = loadExpenses();*/
    try  {
        console.log('Put expense accessed', req.params.id);
        const { id } = req.params;
        const index = expenses.findIndex(exp => exp.id === id);
        if (index === -1) return res.status(404).json({ message: 'Expense not found'});

        expenses[index] = { ...expenses[index], ...req.body };

        /*saveExpenses(expenses);*/
        res.json(expenses[index]);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});

app.delete('/expenses/:id', (req, res) => {
    /*let expenses = loadExpenses();*/
    try {
        console.log('Delete exense accessed', req.params.id);
        const { id } = req.params;

        const initialLength = expenses.length;
        expenses = expenses.filter(exp => exp.id !== id);

        if (index === -1) {
            return res.status(404).json({message: 'Expense not found'})
        }
        /*saveExpenses(expenses);*/
        expenses.splice(index,1);
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
console.log("Server is starting...");
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/`);
});