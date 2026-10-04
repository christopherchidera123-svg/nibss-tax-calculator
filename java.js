        //Toogle button//
        const periodOptions = document.querySelectorAll('.period-toggle button');

        periodOptions.forEach((option) => {
            option.addEventListener('click', () => {
                periodOptions.forEach((item) => {
                    item.setAttribute('aria-pressed', String(item === option));
                });
            });
        });
        function addCommaFormatting(input) {
            input.addEventListener('input', () => {
            const cursorPosition = input.selectionStart;
            const digitsBeforeCursor = input.value
                .slice(0, cursorPosition)
                .replace(/\D/g, '').length;
            const digits = input.value.replace(/\D/g, '');
            const formattedSalary = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            input.value = formattedSalary;

            let newCursorPosition = 0;
            let digitsCounted = 0;

            while (newCursorPosition < formattedSalary.length && digitsCounted < digitsBeforeCursor) {
                if (/\d/.test(formattedSalary[newCursorPosition])) {
                    digitsCounted++;
                }
                newCursorPosition++;
            }

            input.setSelectionRange(newCursorPosition, newCursorPosition);
        });
        }
       ///expenses calculator//
        document.querySelectorAll('.money-input').forEach(addCommaFormatting);

        const totalIncomeInput = document.getElementById('salaries');
        const calculateTaxButton = document.getElementById('calculate-tax');

        function updateCalculateTaxButton() {
            calculateTaxButton.hidden = totalIncomeInput.value.trim() === '';
        }

        totalIncomeInput.addEventListener('input', updateCalculateTaxButton);
         

        //RESULT SPINNER//
        const taxResults = document.getElementById('tax-results');
        const calculateTaxLabel = calculateTaxButton.textContent;
        const analysisPanel = document.getElementById('analysis-panel');
        const resultContent = document.querySelector('.result-content');
        const resetResultButton = document.getElementById('reset-result');
        const statusNote = document.getElementById('status-note');
        const keepResultButton = document.getElementById('keep-result');
        const generatePdfButton = document.getElementById('generate-pdf');

        function formatMoney(value) {
            return new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                maximumFractionDigits: 0
            }).format(value);
        }

        function parseMoney(value) {
            const digits = String(value || '').replace(/[^0-9.-]/g, '');
            const number = Number(digits || 0);
            return Number.isFinite(number) ? number : 0;
        }

        function showAnalysis(grossIncome, expenseTotal, taxDue, takeHome, effectiveRate, expenseAllowed) {
            const placeholders = document.getElementById('yala');
            const helperText = document.getElementById('laya');

            placeholders.textContent = 'Tax result review';
            helperText.textContent = 'Your detailed analysis is ready below.';

            document.getElementById('gross-income-value').textContent = formatMoney(grossIncome);
            document.getElementById('tax-due-value').textContent = formatMoney(taxDue);
            document.getElementById('company-expense-value').textContent = formatMoney(expenseAllowed);
            document.getElementById('take-home-value').textContent = formatMoney(takeHome);

            document.getElementById('ledger-gross').textContent = formatMoney(grossIncome);
            document.getElementById('ledger-expense').textContent = formatMoney(expenseAllowed);
            document.getElementById('ledger-taxable').textContent = formatMoney(Math.max(grossIncome - expenseAllowed, 0));
            document.getElementById('ledger-rate').textContent = `${effectiveRate.toFixed(2)}%`;
            document.getElementById('ledger-tax').textContent = formatMoney(taxDue);
            document.getElementById('ledger-takehome').textContent = formatMoney(takeHome);

            resultContent.classList.add('report-mode');
            analysisPanel.classList.add('visible');
        }

        function resetResultView() {
            analysisPanel.classList.remove('visible');
            resultContent.classList.remove('report-mode');
            document.getElementById('yala').textContent = 'Your result will be displayed here';
            document.getElementById('laya').textContent = 'Fill the form,, instantely to see your TAX breakdown';
            statusNote.textContent = '';
        }

        calculateTaxButton.addEventListener('click', () => {
            const income = parseMoney(totalIncomeInput.value);
            const expenseInputs = document.querySelectorAll('.company-expense-input');
            let totalExpense = 0;

            expenseInputs.forEach((input) => {
                totalExpense += parseMoney(input.value);
            });

            let taxRate = 0.10;
            let expenseRate = 0.08;

            if (income > 1000000 && income <= 5000000) {
                taxRate = 0.14;
                expenseRate = 0.125;
            } else if (income > 5000000 && income <= 30000000) {
                taxRate = 0.25;
                expenseRate = 0.23;
            } else if (income > 30000000 && income <= 1000000000) {
                taxRate = 0.14;
                expenseRate = 0.14;
            }

            const allowedExpense = Math.min(totalExpense, income * expenseRate);
            const taxableIncome = Math.max(income - allowedExpense, 0);
            const taxDue = taxableIncome * taxRate;
            const takeHome = Math.max(income - taxDue, 0);
            const effectiveRate = income > 0 ? (taxDue / income) * 100 : 0;

            calculateTaxButton.disabled = true;
            calculateTaxButton.setAttribute('aria-busy', 'true');
            calculateTaxButton.textContent = 'Checking';
            taxResults.hidden = true;

            let dotCount = 0;
            const checkingInterval = window.setInterval(() => {
                dotCount = (dotCount % 3) + 1;
                calculateTaxButton.textContent = `Checking${'.'.repeat(dotCount)}`;
            }, 250);

            window.setTimeout(() => {
                clearInterval(checkingInterval);
                calculateTaxButton.disabled = false;
                calculateTaxButton.setAttribute('aria-busy', 'false');
                calculateTaxButton.textContent = calculateTaxLabel;
                showAnalysis(income, totalExpense, taxDue, takeHome, effectiveRate, allowedExpense);
            }, 700);
        });

        resetResultButton.addEventListener('click', resetResultView);

        keepResultButton.addEventListener('click', () => {
            const resultData = {
                income: parseMoney(totalIncomeInput.value),
                expenses: Array.from(document.querySelectorAll('.company-expense-input')).reduce((sum, input) => sum + parseMoney(input.value), 0)
            };
            localStorage.setItem('taxResult', JSON.stringify(resultData));
            statusNote.textContent = 'Result saved successfully.';
        });

        generatePdfButton.addEventListener('click', () => {
            statusNote.textContent = 'Preparing your PDF receipt...';
            window.print();
        });
        
       //toogle for customer expenses explanation//
        const expenseToggle = document.getElementById('tam');
        const expenseExplanation = document.getElementById('company-expenses-explanation');

        expenseToggle.addEventListener('click', () => {
            const isExpanded = expenseToggle.getAttribute('aria-expanded') === 'true';
            expenseToggle.setAttribute('aria-expanded', String(!isExpanded));
            expenseExplanation.hidden = isExpanded;
        });
