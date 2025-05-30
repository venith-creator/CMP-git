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
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterBtn = document.getElementById('filterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener("click", exportToCSV);
    let currentEditingItem = null;

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

function groupExpensesByMonth(expenses) {
    const monthlyTotals = {};

    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const key = `${date.getMonth() + 1}-${date.getFullYear()}`;

        if (!monthlyTotals[key]) {
            monthlyTotals[key] = 0;
        }

        monthlyTotals[key] += Number(exp.amount);
    });
    return monthlyTotals;
}

async function handleAddOrUpdate ()  {
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    if(!desc || isNaN(amount) || amount <= 0) {
        [descInput, amountInput].forEach(input => {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 300);
        });
        showToast("Please enter a valid description and amount.", "error");
        return;
    }
    try {
        const editingId = addBtn.dataset.editingId;

        if(editingId) {
            await updateExpenseAPI(editingId, {desc,
                 amount,
                  category,
                   date: currentEditingItem?.date || new Date().toISOString()
                });
                showToast("Expense updated!", "success");
            currentEditingItem = null;
            delete addBtn.dataset.editingId;
            document.querySelectorAll('.editing').forEach(el => el.classList.remove('editing'));
            addBtn.textContent = "Add";
            cancelEditBtn.style.display = "none";
        }else {
            await addExpenseAPI({desc, amount, category});
            showToast("Expense added successfully!", "success");
        }
        descInput.value = '';
        amountInput.value = '';
        await loadAndRender();
        displayMonthlyBreakdown(expenses);
    } catch (error) {
        console.error("failed to add/update expense", error);
        showToast('Something went wrong. Check the console.', 'error');
    }    
}
addBtn.addEventListener('click', handleAddOrUpdate);

function showToast(message, type = "info") {

    const toastContainer = document.getElementById("toast-container");

    if (!toastContainer){
        console.warn("Toast container not found. Logging to console instead.");
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
        return;
    }
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.classList.add(type);

    if (type === "error") toast.style.backgroundColor = "#dc3545";
    if (type === "success") toast.style.backgroundColor = "#28a745";
    if (type === "info") toast.style.backgroundColor = "#007bff";

    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function displayMonthlyBreakdown(expenses) {
    const breakdownList = document.getElementById("monthlyBreakdownList");
    if (!breakdownList) return;

    breakdownList.innerHTML = '';
    const grouped = groupExpensesByMonth(expenses);

    for (const [monthYear, total] of Object.entries(grouped)) {
        const li = document.createElement("li");
        li.textContent = `${monthYear}: N${total.toLocaleString()}`;
        breakdownList.appendChild(li);
    }
}

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Description,Amount,Category,Date\n";

    expenses.forEach(exp => {
        const row = [
            `"${exp.desc}"`,
            exp.amount,
            exp.category || "Uncategorized",
            new Date(exp.date).toLocaleString()
        ].join(", ");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

expenseList.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if(e.target.classList.contains('deleteBtn')){
        if(!id){
            console.warn("Delete failed: No ID found.");
            showToast("Cannot delete: ID missing.", "error");
            return;
        }
        try{
             await deleteExpenseAPI(id);
            await loadAndRender();
            showToast("Expense deleted.", "info");
        } catch (err){
            console.error("Delete failed.", err);
            showToast("Failed to delete expense. Check console.", "error");
        }
    }
    if(e.target.classList.contains('editBtn')){
        document.querySelectorAll('.editing').forEach(el => el.classList.remove('editing'));
        const latest = await fetchExpenses();
        const item = latest.find(exp => exp.id === id);
        currentEditingItem = item;
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
    currentEditingItem = null;
});
document.addEventListener('keydown', (e) => {
    const isFocused = 
    document.activeElement === descInput ||
    document.activeElement === amountInput;

    if (e.key === 'Enter' && isFocused){
        addBtn.click();
    }
});
filterBtn.addEventListener('click', () => {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if(!startDateInput.value || !endDateInput.value) {
        showToast("please select both start and end dates.", "error");
        return;
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const filtered = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startDate && expDate <= endDate;
    });
    renderExpenses(expenseList, totalDisplay, searchInput.value, sortSelect.value, filtered);
    console.log("Start:", startDate);
    console.log("End:", endDate);
    console.log("All expenses:", expenses);
    console.log("Filtered:", filtered);
});

clearFilterBtn.addEventListener('click', () => {
    startDateInput.value ='';
    endDateInput.value = '';
    renderExpenses(expenseList, totalDisplay, searchInput.value, sortSelect.value);
});

const darkModeToggle = document.getElementById('darkModeToggle');

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
});

window.addEventListener('DOMContentLoaded', () => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});
async function loadAndRender() {
    const data = await fetchExpenses();
    expenses.length = 0;
    expenses.push(...data);
    renderExpenses(expenseList, totalDisplay, searchInput.value, sortSelect.value);
    displayMonthlyBreakdown(expenses);
}
loadAndRender();
});