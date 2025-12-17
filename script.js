// ==========================================
// 1. DESIGN PATTERN: OBSERVER PATTERN
// Requirement: Design Pattern 
// Purpose: When data changes, automatically notify the Chart and Summary to update.
// ==========================================
class Subject {
    constructor() {
        this.observers = [];
    }
    subscribe(observer) {
        this.observers.push(observer);
    }
    notify(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}

// ==========================================
// 2. OOP: DATA MODELS
// Requirement: Object Oriented Programming 
// ==========================================
class Transaction {
    constructor(date, amount, type, category) {
        this.date = date;
        this.amount = parseFloat(amount);
        this.type = type; // 'income' or 'expense'
        this.category = category;
    }
}

// Singleton Data Manager
const DataManager = {
    transactions: [],
    subject: new Subject(), // The "Broadcaster"

    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.subject.notify(this.transactions); // Notify all observers
    },

    getSummary() {
        let income = 0;
        let expense = 0;
        this.transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });
        return { income, expense, net: income - expense };
    }
};

// ==========================================
// 3. CONTROLLERS (Logic)
// ==========================================

const AuthController = {
    login() {
        // Simple mock login
        const user = document.getElementById("username").value;
        if(user) {
            document.getElementById("login-page").style.display = "none";
            document.getElementById("app-layout").style.display = "block";
            Navigation.goTo('dashboard-page');
        } else {
            alert("Please enter a username");
        }
    },
    logout() {
        location.reload(); // Simplest logout
    }
};

const Navigation = {
    goTo(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        // Show target page
        document.getElementById(pageId).style.display = 'block';
    }
};

const ExpenseController = {
    addItem() {
        const date = document.getElementById("date").value;
        const amount = document.getElementById("amount").value;
        const type = document.getElementById("type").value;
        const category = document.getElementById("category").value;

        if (!date || !amount) {
            alert("Please fill in all fields.");
            return;
        }

        const t = new Transaction(date, amount, type, category);
        DataManager.addTransaction(t);
    }
};

// ==========================================
// 4. OBSERVERS (The "Listeners")
// ==========================================

const SummaryObserver = {
    update(transactions) {
        const stats = DataManager.getSummary();
        const list = document.getElementById("transaction-list");
        const profitLabel = document.getElementById("net-profit");
        const reportMsg = document.getElementById("report-msg");

        // Update Text
        profitLabel.innerText = stats.net.toFixed(2);
        profitLabel.style.color = stats.net >= 0 ? "green" : "red";

        // Update List
        list.innerHTML = "";
        transactions.slice().reverse().forEach(t => {
            const color = t.type === 'income' ? 'green' : 'red';
            list.innerHTML += `<li style="color:${color}">${t.date} - ${t.category}: RM ${t.amount}</li>`;
        });

        // Update Notification Message
        reportMsg.value = `Hello, here is my Gig Finance Report.\nTotal Income: RM ${stats.income}\nTotal Expenses: RM ${stats.expense}\nNet Profit: RM ${stats.net}`;
    }
};

const ChartObserver = {
    chartInstance: null,
    
    update(transactions) {
        const ctx = document.getElementById('financeChart');
        const stats = DataManager.getSummary();

        if (this.chartInstance) this.chartInstance.destroy();

        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    data: [stats.income, stats.expense],
                    backgroundColor: ['#2ecc71', '#e74c3c']
                }]
            }
        });
    }
};

// ==========================================
// 5. NOTIFICATION SERVICE
// Requirement: Output display (email, whatsapp) 
// ==========================================
const NotificationService = {
    sendWhatsApp() {
        const msg = encodeURIComponent(document.getElementById("report-msg").value);
        // Opens WhatsApp Web API
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    },
    sendEmail() {
        const msg = encodeURIComponent(document.getElementById("report-msg").value);
        // Opens Default Mail Client
        window.open(`mailto:?subject=Monthly Finance Report&body=${msg}`);
    }
};

// INITIALIZATION: Hook up Observers
DataManager.subject.subscribe(SummaryObserver);
DataManager.subject.subscribe(ChartObserver);
