const BASE_URL = "http://localhost:3000/expenses";

export async function fetchExpenses() {
    const res = await fetch(BASE_URL);
    return await res.json();
}
export async function addExpenseAPI({desc, amount, category}) {
    const now = new Date();
    const expense = {
        desc,
        amount,
        category,
        date: now.toISOString()
    };
    const res = await fetch('http://localhost:3000/expenses',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(expense)
    });
    return  res.json();
}
export async function deleteExpenseAPI(id){
    await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
    });
}

export async function updateExpenseAPI(id, updatedExpense){
    const res = await fetch(`${BASE_URL}/${id}`,{
        method: 'PUT',
        headers: {
            'content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...updatedExpense,
            date: new Date().toISOString()
        })
    });
    return await res.json();
}