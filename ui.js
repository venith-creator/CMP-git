import { expenses } from "./data.js";
function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff/ (1000 * 60 * 60));
    const days = Math.floor(diff/ (1000 * 60 * 60 * 24));

    if (isNaN(past.getTime())) return "unknown time";
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function filterExpenses(expenses, filterText){
    return expenses.filter(item => 
        item.desc.toLowerCase().includes(filterText.toLowerCase())
    );
}

function sortExpenses(filtered, sortOrder){
    if(sortOrder ==='latest'){
        return filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    } else if (sortOrder === 'oldest'){
        return filtered.sort((a,b) => new Date (a.date) - new Date(b.date));
    }
    return filtered;
}

function createExpenseItem(item, index, editingId) {
    const li = document.createElement('li');
    li.dataset.id = item.id;
        li.innerHTML = `
        <strong>${item.desc}</strong> - N${item.amount.toFixed(2)}<br/>
        <em style="color: teal;">${item.category || 'Uncategorized'}</em><br/>
        <small style="color: gray;" title="${new Date(item.date).toLocaleString()}">${item.date ? timeAgo(item.date): "unknown time"}</small><br/>
        <button data-id="${item.id}" class="deleteBtn">Delete</button>
        <button data-id="${item.id}" class="editBtn">Edit</button>
        `;
        li.classList.add('expense-item');

        const latestItem = expenses[expenses.length - 1];
        if(editingId === null && item ===  latestItem){
            li.classList.add('highlight');
            setTimeout(() => li.classList.remove('highlight'),600);
        }
        if(editingId === item.id){li.classList.add('editing');}

        return li; 
}

export function renderExpenses(expenseList, totalDisplay, filterText = '', sortOrder = 'latest'){
    expenseList.innerHTML = '';

    let filtered = filterExpenses(expenses, filterText);
    filtered = sortExpenses(filtered, sortOrder);

    const editingId = document.getElementById('addBtn').dataset.editingId;
    filtered.forEach((item, index) => {
        const li = createExpenseItem(item, index, editingId || null);
        expenseList.appendChild(li);

    });

    const total = filtered.reduce((sum, item) => sum + item.amount, 0);
    totalDisplay.textContent = total.toFixed(2);
}