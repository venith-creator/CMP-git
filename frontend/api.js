/*import { expenses } from "./data";*/

const BASE_URL = "https://cmp-git-production-8847.up.railway.app";

export async function fetchExpenses() {
    const res = await fetch(`${BASE_URL}/expenses`);
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
    const res = await fetch(`${BASE_URL}/expenses`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(expense)
    });
    return await  res.json();
}
export async function deleteExpenseAPI(id){
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok){
        const errorText = await res.text();
        throw new Error(`Failed to delete expense with ID ${id}. Server says: ${errorText}`);
    }
}

export async function updateExpenseAPI(id, updatedExpense){
    const res = await fetch(`${BASE_URL}/expenses/${id}`,{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedExpense)
    });
    return await res.json();
}