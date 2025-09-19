// ================= Page Switcher =================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  if (pageId === 'aboutPage') showAboutSummary();
  if (pageId === 'historyPage') renderTransactionHistory();
}

// ================= User Auth (Signup & Login) =================
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

// Handle Signup
signupForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const user = {
    name: document.getElementById('signupName').value.trim(),
    email: document.getElementById('signupEmail').value.trim(),
    phone: document.getElementById('signupPhone').value.trim(),
    dob: document.getElementById('signupDob').value,
    password: document.getElementById('signupPassword').value
  };

  if (localStorage.getItem(user.phone)) {
    alert("⚠ Phone number already registered!");
    return;
  }
  localStorage.setItem(user.phone, JSON.stringify(user));
  alert("✅ Signup successful! Please login.");
  signupForm.reset();
  showPage('loginPage');
});

// Handle Login
loginForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const phone = document.getElementById('loginPhone').value.trim();
  const password = document.getElementById('loginPassword').value;

  const storedUser = localStorage.getItem(phone);
  if (!storedUser) {
    alert("⚠ User not found. Please sign up first.");
    return;
  }

  const user = JSON.parse(storedUser);
  if (user.password === password) {
    alert(`✅ Welcome back, ${user.name}!`);
    localStorage.setItem("currentUser", phone);
    showPage('homePage');
  } else {
    alert("❌ Incorrect password!");
  }
});

// ================= Logout =================
function logoutUser() {
  localStorage.removeItem("currentUser");
  alert("👋 Logged out successfully!");
  showPage('startPage');
}

// ================= Expense Tracker =================
const form = document.getElementById('form');
const list = document.getElementById('list');
const balance = document.getElementById('balance');
const money_plus = document.getElementById('income');
const money_minus = document.getElementById('expense');

let transactions = [];
let salaries = {};
let selectedMonth = '';

// ================= Set Monthly Salary =================
function setMonthlySalary() {
  const monthInput = document.getElementById('monthInput').value;
  const salaryInput = document.getElementById('monthlySalary').value;

  if (monthInput && salaryInput && !isNaN(salaryInput)) {
    selectedMonth = monthInput;
    salaries[selectedMonth] = +salaryInput;
    updateBalance();
    alert(`Salary of ₹${+salaryInput} set for ${selectedMonth}`);
    document.getElementById('monthInput').value = '';
    document.getElementById('monthlySalary').value = '';
  } else {
    alert('⚠ Please enter valid month and salary');
  }
}

// ================= Add Transaction =================
form?.addEventListener('submit', function (e) {
  e.preventDefault();
  const text = document.getElementById('text').value.trim();
  const amount = +document.getElementById('amount').value;

  if (text === '' || isNaN(amount) || !selectedMonth) {
    alert('⚠ Please enter valid text, amount, and set month/salary first');
    return;
  }

  const monthlyTransactions = transactions.filter(t => t.year + '-' + t.month === selectedMonth);
  const transactionIncome = monthlyTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = monthlyTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const salary = salaries[selectedMonth] || 0;
  const currentBalance = salary + transactionIncome - totalExpenses;

  if (amount < 0 && Math.abs(amount) > currentBalance) {
    alert('⚠ Insufficient balance! You cannot spend more than your available balance.');
    return;
  }

  const now = new Date();
  const transactionDate = now.toLocaleDateString();

  const transaction = {
    id: Date.now(),
    text,
    amount,
    month: selectedMonth.split('-')[1],
    year: selectedMonth.split('-')[0],
    date: transactionDate
  };

  transactions.push(transaction);
  updateBalance();
  renderTransactionHistory();
  form.reset();
});

// ================= Add Transaction to DOM =================
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'expense' : 'income');
  item.innerHTML = `
    ${transaction.text} 
    <span>${sign}₹${Math.abs(transaction.amount).toFixed(2)}</span>
    <small style="margin-left:10px; color:#555;">(${transaction.date})</small>
  `;
  list.appendChild(item);
}

// ================= Update Balance =================
function updateBalance() {
  if (!selectedMonth) return;
  const monthlyTransactions = transactions.filter(t => t.year + '-' + t.month === selectedMonth);
  const transactionIncome = monthlyTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = monthlyTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const salary = salaries[selectedMonth] || 0;

  const totalIncome = salary + transactionIncome;
  const currentBalance = totalIncome - totalExpenses;

  balance.innerText = `₹${currentBalance.toFixed(2)}`;
  money_plus.innerText = `₹${totalIncome.toFixed(2)}`;
  money_minus.innerText = `₹${totalExpenses.toFixed(2)}`;
}

// ================= Render History =================
function renderTransactionHistory() {
  list.innerHTML = '';
  if (!selectedMonth) return;
  const monthlyTransactions = transactions.filter(t => t.year + '-' + t.month === selectedMonth);
  monthlyTransactions.forEach(addTransactionDOM);
}

// ================= About / Summary =================
function showAboutSummary() {
  const summaryBody = document.getElementById('summaryBody');
  summaryBody.innerHTML = '';
  const months = Object.keys(salaries).sort();
  let yearlyIncome = 0, yearlyExpenses = 0;

  months.forEach(monthKey => {
    const [year, month] = monthKey.split('-');
    const monthlyTransactions = transactions.filter(t => t.year === year && t.month === month);
    const transactionIncome = monthlyTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const monthlyExpenses = monthlyTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const salary = salaries[monthKey] || 0;
    const totalIncomeMonth = salary + transactionIncome;
    const remaining = totalIncomeMonth - monthlyExpenses;

    yearlyIncome += salary + transactionIncome;
    yearlyExpenses += monthlyExpenses;

    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${monthName} ${year}</td>
      <td>₹${salary.toFixed(2)}</td>
      <td>₹${totalIncomeMonth.toFixed(2)}</td>
      <td>₹${monthlyExpenses.toFixed(2)}</td>
      <td>₹${remaining.toFixed(2)}</td>
    `;
    summaryBody.appendChild(row);
  });

   const totalSalary = Object.values(salaries).reduce((acc,s)=>acc+s,0);
  const yearlyRemaining = totalSalary + yearlyIncome - yearlyExpenses;
  document.getElementById('yearlySummary').innerHTML = `
    <strong>Yearly Summary:</strong><br>
    Total Salary: ₹${totalSalary.toFixed(2)} <br>
    Total Income (Excl Salary): ₹${yearlyIncome.toFixed(2)} <br>
    Total Expenses: ₹${yearlyExpenses.toFixed(2)} <br>
    Remaining Amount: ₹${yearlyRemaining.toFixed(2)}
  `;
}