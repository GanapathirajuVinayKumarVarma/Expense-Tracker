// --- Expense Tracker Logic ---
const API_URL = 'http://localhost:3000';
let expenses = [];
let categories = [];
// Initialize by fetching from backend API
async function initData() {
    try {
        const [expRes, catRes] = await Promise.all([
            fetch(`${API_URL}/expenses`),
            fetch(`${API_URL}/categories`)
        ]);
        expenses = await expRes.json();
        categories = await catRes.json();
        updateUI();
    } catch (err) {
        console.error("Error fetching data from API:", err);
        alert("Failed to connect to backend server. Make sure node server.js is running!");
    }
}
function updateSummary() {
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals = expenses.reduce((acc, exp) => {
        const cat = exp.category_name || "Unknown";
        acc[cat] = (acc[cat] || 0) + exp.amount;
        return acc;
    }, {});    
    let highestCategory = { name: 'None', amount: 0 };
    for (const [cat, amount] of Object.entries(categoryTotals)){
        if (amount > highestCategory.amount) {
            highestCategory = { name: cat, amount: amount };
        }
    }
    const totalSpendingEl = document.getElementById('total-spending');
    const highestSpendingEl = document.getElementById('highest-spending');
    if (totalSpendingEl) totalSpendingEl.innerText = `₹ ${totalAmount.toFixed(2)}`;
    if (highestSpendingEl) highestSpendingEl.innerText = `🔥 ${highestCategory.name} (₹${highestCategory.amount})`;
}
// Delete specific expense via API
async function deleteExpense(id) {
    if(confirm('Delete this expense?')) {
        try {
            await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
            await initData();
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    }
}
// Delete all expenses via API
async function clearAll() {
    if(confirm('Are you sure you want to clear ALL expenses permanently?')) {
        try {
            await fetch(`${API_URL}/expenses`, { method: 'DELETE' });
            await initData();
        } catch (err) {
            console.error("Failed to clear:", err);
        }
    }
}
// Render dynamic UI
function updateUI() {
    updateSummary();
    renderExpenses();
    renderCategories();
}
function getCategoryEmoji(name) {
    const n = name.toLowerCase();
    if (n.includes('food') || n.includes('eat') || n.includes('meal') || n.includes('lunch') || n.includes('dinner')) return '🍔';
    if (n.includes('entertainment') || n.includes('movie') || n.includes('game') || n.includes('fun')) return '🎬';
    if (n.includes('house') || n.includes('home') || n.includes('rent')) return '🏠';
    if (n.includes('travel') || n.includes('transport') || n.includes('car') || n.includes('bus')) return '🚗';
    if (n.includes('health') || n.includes('medical') || n.includes('doctor')) return '🏥';
    if (n.includes('utility') || n.includes('bill') || n.includes('electricity')) return '💡';
    return '🏷️';
}
function renderCategories() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;
    grid.innerHTML = '';
    categories.forEach(cat => {
        // Grid Button
        const wrapper = document.createElement('div');
        wrapper.className = 'category-item-wrapper';
        const btn = document.createElement('button');
        btn.className = 'category-btn glass-panel';
        const emoji = getCategoryEmoji(cat.name);
        btn.innerHTML = `<span style="font-size: 32px;">${emoji}</span><span>${cat.name}</span>`;
        btn.onclick = () => openQuickExpenseModal(cat.id, cat.name);
        wrapper.appendChild(btn);
        // Delete Category overlay button
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '✕';
        delBtn.style.position = 'absolute';
        delBtn.style.top = '-8px';
        delBtn.style.right = '-8px';
        delBtn.style.width = '24px';
        delBtn.style.height = '24px';
        delBtn.style.borderRadius = '50%';
        delBtn.style.background = '#ff4d4d';
        delBtn.style.color = 'white';
        delBtn.style.border = 'none';
        delBtn.style.cursor = 'pointer';
        delBtn.style.display = 'flex';
        delBtn.style.alignItems = 'center';
        delBtn.style.justifyContent = 'center';
        delBtn.style.fontSize = '12px';
        delBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        delBtn.title = 'Delete Category';
        delBtn.onclick = (e) => {
            e.stopPropagation(); // prevent modal opening
            deleteCategory(cat.id, cat.name);
        };
        wrapper.appendChild(delBtn);

        grid.appendChild(wrapper);
    });
    // "New Category" Button at the end of grid
    const newCatWrapper = document.createElement('div');
    newCatWrapper.className = 'category-item-wrapper';
    const newCatBtn = document.createElement('button');
    newCatBtn.className = 'category-btn glass-panel';
    newCatBtn.style.borderStyle = 'dashed';
    newCatBtn.style.background = 'rgba(255,255,255,0.02)';
    newCatBtn.innerHTML = `<span style="font-size: 32px;">➕</span><span>New Category</span>`;
    newCatBtn.onclick = openAddCategoryModal;
    
    newCatWrapper.appendChild(newCatBtn);
    grid.appendChild(newCatWrapper);
}
// Delete category logic
async function deleteCategory(id, name) {
    if (confirm(`Are you sure you want to delete the category "${name}"? This will also delete all associated expenses.`)) {
        try {
            const response = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await initData();
            } else {
                const errData = await response.json();
                alert("Failed to delete category: " + (errData.error || "Unknown"));
            }
        } catch (err) {
            console.error("Failed to delete category:", err);
            alert("Error deleting category");
        }
    }
}
// Categories Add Modal Logic
function openAddCategoryModal() {
    document.getElementById('modal-new-category-name').value = '';
    document.getElementById('add-category-modal').style.display = 'flex';
}
function closeAddCategoryModal() {
    document.getElementById('add-category-modal').style.display = 'none';
}
async function addCategory() {
    const input = document.getElementById('modal-new-category-name');
    const name = input.value.trim();
    if (!name) {
        alert("Please enter a category name");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });   
        if (response.ok) {
            closeAddCategoryModal();
            await initData();
        } else {
            const errData = await response.json();
            alert("Failed to add category: " + (errData.error || "Unknown"));
        }
    } catch (err) {
        console.error("Failed to add category:", err);
    }
}
// Quick Expense Logic
let currentQuickCategory = null;
function openQuickExpenseModal(categoryId, categoryName) {
    currentQuickCategory = { id: categoryId, name: categoryName };
    document.getElementById('modal-category-name').textContent = `Add Expense to ${categoryName}`;
    document.getElementById('modal-reason').value = '';
    document.getElementById('modal-amount').value = '';
    document.getElementById('modal-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('quick-expense-modal').style.display = 'flex';
}
function closeQuickExpenseModal() {
    document.getElementById('quick-expense-modal').style.display = 'none';
    currentQuickCategory = null;
}
async function saveQuickExpense() {
    if (!currentQuickCategory) return;
    const reasonValue = document.getElementById('modal-reason').value.trim();
    const amount = document.getElementById('modal-amount').value;
    const date = document.getElementById('modal-date').value;
    if (!amount) {
        alert("Please enter an amount");
        return;
    }
    const payload = {
        category_id: currentQuickCategory.id,
        category_name: currentQuickCategory.name,
        reason: reasonValue || "Expense",
        amount: parseFloat(amount),
        date: date || new Date().toISOString()
    };
    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });    
        if(response.ok) {
            closeQuickExpenseModal();
            await initData();
        } else {
            console.error(await response.json());
        }
    } catch (err) {
        console.error("Failed to add:", err);
    }
}
function renderExpenses() {
    const container = document.getElementById('expenses-container');
    if (!container) return;
    container.innerHTML = ''; 
    // Group expenses by category_name
    const grouped = expenses.reduce((acc, exp) => {
        const cat = exp.category_name || "Unknown";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(exp);
        return acc;
    }, {});
    for (const [category, items] of Object.entries(grouped)) {
        const groupTotal = items.reduce((sum, item) => sum + item.amount, 0);
        let htmlSnippet = `
            <div class="expense-group">
                <h4 class="group-header">
                    ${category}
                    <span class="group-total">₹${groupTotal.toFixed(2)}</span>
                </h4>
        `;
        items.forEach(item => {
            // Fix datetime format if it includes ISO 
            const displayDate = new Date(item.date).toLocaleDateString();
            htmlSnippet += `
                <div class="glass-panel expense-item">
                    <div class="expense-info">
                        <div class="expense-title">${item.reason}</div>
                        <div class="expense-date">${displayDate}</div>
                    </div>
                    <div class="expense-amount-wrapper">
                        <span class="expense-amount">₹${item.amount.toFixed(2)}</span>
                        <div class="btn-group">
                            <button onclick="deleteExpense(${item.id})" style="background:rgba(255,100,100,0.1); border:none; border-radius: 6px; padding: 6.4px; cursor:pointer;" title="Delete">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });
        htmlSnippet += `</div>`;
        container.innerHTML += htmlSnippet;
    }
}
// Analysis Modal Logic
let barChartInstance = null;
let pieChartInstance = null;
function renderAnalysis() {
    const modal = document.getElementById('analysis-modal');
    if (!modal) return;
    // Aggregate data
    const categoryTotals = expenses.reduce((acc, exp) => {
        const cat = exp.category_name || "Unknown";
        acc[cat] = (acc[cat] || 0) + exp.amount;
        return acc;
    }, {});
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    // Common colors
    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];
    const borderColors = backgroundColors.map(c => c.replace('0.7', '1'));
    // Chart.js global dark mode tweaks
    Chart.defaults.color = '#a0a0b0';
    Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';
    // Bar Chart
    const barCtx = document.getElementById('barChart');
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Spending (₹)',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Spending by Category (Bar)', color: '#fff', font: {size: 16} }
            }
        }
    });
    // Pie Chart
    const pieCtx = document.getElementById('pieChart');
    if (pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Spending Distribution (Pie)', color: '#fff', font: {size: 16} },
                legend: { position: 'bottom' }
            }
        }
    });
    modal.style.display = 'flex';
}
function closeAnalysis() {
    document.getElementById('analysis-modal').style.display = 'none';
}
// --- Initialization & Hooks ---
document.addEventListener('DOMContentLoaded', () => {
    initData();
    // Attach click events
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    const cancelAddCategoryBtn = document.getElementById('add-category-cancel-btn');
    if (cancelAddCategoryBtn) cancelAddCategoryBtn.addEventListener('click', closeAddCategoryModal);
    const saveAddCategoryBtn = document.getElementById('add-category-save-btn');
    if (saveAddCategoryBtn) saveAddCategoryBtn.addEventListener('click', addCategory);
    const cancelModalBtn = document.getElementById('modal-cancel-btn');
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeQuickExpenseModal);
    const saveModalBtn = document.getElementById('modal-save-btn');
    if (saveModalBtn) saveModalBtn.addEventListener('click', saveQuickExpense);
    const showAnalysisBtn = document.getElementById('show-analysis-btn');
    if (showAnalysisBtn) showAnalysisBtn.addEventListener('click', renderAnalysis);
    const closeAnalysisBtn = document.getElementById('close-analysis-btn');
    if (closeAnalysisBtn) closeAnalysisBtn.addEventListener('click', closeAnalysis);
});