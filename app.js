import {expenses} from './data.js';

import { renderExpenses } from './ui.js';
import { fetchExpenses, addExpenseAPI, updateExpenseAPI, deleteExpenseAPI } from './api.js';
document.addEventListener("DOMContentLoaded", () => {
    const descInput = document.getElementById('descInput');
    const amountInput = document.getElementById('amountInput');
    const addBtn = document.getElementById('addBtn');
    const categorySelect = document.getElementById('expense-category');
    const expenseList = document.getElementById('expenseList');
    const totalDisplay = document.getElementById('totalDisplay');
    const searchInput = document.getElementById('searchInput');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const sortSelect = document.getElementById('sortSelect');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    console.log({
        descInput,
        amountInput,
        addBtn,
        categorySelect,
        expenseList,
        totalDisplay,
        searchInput,
        clearAllBtn,
        sortSelect,
        cancelEditBtn
    });

    // ... rest of your code below

/*const descInput = document.getElementById('descInput');
const amountInput = document.getElementById('amountInput');
const addBtn = document.getElementById('addBtn');
const categorySelect = document.getElementById('expense-category');
const expenseList = document.getElementById('expenseList');
const totalDisplay = document.getElementById('totalDisplay');
const searchInput = document.getElementById('searchInput');
const clearAllBtn = document.getElementById('clearAllBtn');
const sortSelect = document.getElementById('sortSelect');
const cancelEditBtn = document.getElementById('cancelEditBtn');*/
cancelEditBtn.title = "Cancel editing and go back";

function saveAndRender(){
    saveExpenses();
    renderExpenses(expenseList, totalDisplay, searchInput.value, sortSelect.value);
}

async function handleAddOrUpdate ()  {
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    if(!desc || isNaN(amount) || amount <= 0) {
        [descInput, amountInput].forEach(input => {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 300);
        })
        return;
    }
    try {
        const editingId = addBtn.dataset.editingId;

        if(editingId) {
            await updateExpenseAPI(editingId, {desc, amount, category});
            delete addBtn.dataset.editingId;
            document.querySelectorAll('.editing').forEach(el => el.classList.remove('editing'));
            addBtn.textContent = "Add";
            cancelEditBtn.style.display = "none";
        }else {
            await addExpenseAPI({desc, amount, category});
        }
        descInput.value = '';
        amountInput.value = '';
        await loadAndRender();
    } catch (error) {
        console.error("failed to add/update expense", error);
        alert('An error occured. Check the console.');
    }    
}
addBtn.addEventListener('click', handleAddOrUpdate);

expenseList.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if(e.target.classList.contains('deleteBtn')){
        await deleteExpenseAPI(id);
        await loadAndRender();
    }
    if(e.target.classList.contains('editBtn')){
        document.querySelectorAll('.editing').forEach(el => el.classList.remove('editing'));
        const item = expenses.find(exp => exp.id === id);
        if(!item){
            console.warn('Invalid expense or ID not found');
            return;
        }
        
        descInput.value = item.desc;
        amountInput.value = item.amount;
        addBtn.dataset.editingId = item.id;
        addBtn.textContent = 'update';
        cancelEditBtn.style.display = "inline";
        descInput.focus();
        categorySelect.value = item.category || "Uncategorized";

        const listItem = e.target.closest('li');
        if(listItem) listItem.classList.add('editing');
    }
});
searchInput.addEventListener('input', () => {
    renderExpenses(expenseList, totalDisplay, searchInput.value);
});

clearAllBtn.addEventListener('click', async () => {
    if (confirm("Clear all expenses?")){
        for ( const item of expenses){
            await deleteExpenseAPI(item.id);
        }
        await loadAndRender();
    }
});

sortSelect.addEventListener('change', () => {
    renderExpenses(expenseList, totalDisplay, searchInput.value, sortSelect.value);
});

cancelEditBtn.addEventListener('click', () => {
    descInput.value = '';
    amountInput.value = '';
    addBtn.textContent = "Add";
    delete addBtn.dataset.editingId;
    document.querySelectorAll('.editing').forEach(el => el.classList.remove('editing'));
    cancelEditBtn.style.display = "none";
    categorySelect.value = "Uncategorized";
});
document.addEventListener('keydown', (e) => {
    const isFocused = 
    document.activeElement === descInput ||
    document.activeElement === amountInput;

    if (e.key === 'Enter' && isFocused){
        addBtn.click();
    }
});

async function loadAndRender() {
    const data = await fetchExpenses();
    expenses.length = 0;
    expenses.push(...data);
    renderExpenses(expenseList, totalDisplay, searchInput.value, sortSelect.value);
}
loadAndRender();
});