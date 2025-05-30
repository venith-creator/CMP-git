const BASE_URL = "https://cmp-git-production-824f.up.railway.app/expenses";

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
    const res = await fetch(BASE_URL,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(expense)
    });
    return  res.json();
}
export async function deleteExpenseAPI(id){
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok){
        const errorText = await res.text();
        throw new Error(`Failed to delete expense with ID ${id}. Server says: ${errorText}`);
    }
}

export async function updateExpenseAPI(id, updatedExpense){
    const res = await fetch(`${BASE_URL}/${id}`,{
        method: 'PUT',
        headers: {
            'content-Type': 'application/json'
        },
        body: JSON.stringify(updatedExpense)
    });
    return await res.json();
}