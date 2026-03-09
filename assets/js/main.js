document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    const swapBtn = document.getElementById('swap-btn');
    const resultValue = document.getElementById('result-value');
    const resultCurrency = document.getElementById('result-currency');
    const rateInfo = document.getElementById('rate-info');
    const updateTime = document.getElementById('update-time');
    const loadingIndicator = document.getElementById('loading-indicator');

    // History Elements
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');

    // --- State ---
    let exchangeData = null;
    let rates = null;
    let baseCurrency = 'USD';
    let history = JSON.parse(localStorage.getItem('currencyHistory')) || [];

    // --- Initialization ---
    async function init() {
        showLoading(true);
        await fetchRates();
        if (rates) {
            populateSelects();
            renderHistory();
            calculateConversion();
        } else {
            alertVisual('Error al cargar las tasas de cambio.');
        }
        showLoading(false);
    }

    // --- API & Data ---
    async function fetchRates() {
        try {
            const response = await fetch('https://cdn.moneyconvert.net/api/latest.json');
            if (!response.ok) throw new Error('Network response was not ok');
            exchangeData = await response.json();
            rates = exchangeData.rates;
            baseCurrency = exchangeData.base || 'USD';
        } catch (error) {
            console.warn('Error fetching from API, falling back to local JSON', error);
            try {
                const fallbackResponse = await fetch('assets/data/latest.json');
                if (!fallbackResponse.ok) throw new Error('Fallback also failed');
                exchangeData = await fallbackResponse.json();
                rates = exchangeData.rates;
                baseCurrency = exchangeData.base || 'USD';
            } catch (fallbackError) {
                console.error('Failed to load local fallback:', fallbackError);
            }
        }
    }

    // --- UI Rendering ---
    function populateSelects() {
        const currencyCodes = Object.keys(rates).sort();

        // Clear previous
        while (fromSelect.firstChild) fromSelect.removeChild(fromSelect.firstChild);
        while (toSelect.firstChild) toSelect.removeChild(toSelect.firstChild);

        currencyCodes.forEach(code => {
            const optionFrom = document.createElement('option');
            optionFrom.value = code;
            optionFrom.textContent = code;

            const optionTo = document.createElement('option');
            optionTo.value = code;
            optionTo.textContent = code;

            fromSelect.appendChild(optionFrom);
            toSelect.appendChild(optionTo);
        });

        // Set default values (e.g. USD to EUR)
        if (rates['USD']) fromSelect.value = 'USD';
        if (rates['EUR']) toSelect.value = 'EUR';
    }

    // --- Logic ---
    function getRate(currency) {
        if (currency === baseCurrency) return 1;
        return rates[currency] || 0;
    }

    function convert(amount, fromId, toId) {
        const fromRate = getRate(fromId);
        const toRate = getRate(toId);

        if (!fromRate || !toRate) return 0;

        // Convert to base, then to target
        const amountInBase = amount / fromRate;
        return amountInBase * toRate;
    }

    function calculateConversion() {
        if (!rates) return;

        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount < 0) {
            resultValue.textContent = '0.00';
            return;
        }

        const fromId = fromSelect.value;
        const toId = toSelect.value;

        const convertedAmount = convert(amount, fromId, toId);
        const ratePerOne = convert(1, fromId, toId);

        // Update UI
        resultValue.textContent = formatNumber(convertedAmount);
        resultCurrency.textContent = toId;

        rateInfo.textContent = `1 ${fromId} = ${formatNumber(ratePerOne, 5)} ${toId}`;

        if (exchangeData && exchangeData.ts) {
            const date = new Date(exchangeData.ts);
            updateTime.textContent = `Actualizado: ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            updateTime.textContent = 'Actualizado recientemente';
        }

        // Only save history if the user changed the amount (debounce or manual check could be better, 
        // but for now we'll update history if it's a valid conversion and we'll save the last state).
        // Let's debounce the history saving slightly so it doesn't spam on every keystroke.
        clearTimeout(window.historyTimeout);
        window.historyTimeout = setTimeout(() => {
            saveToHistory(amount, fromId, convertedAmount, toId);
        }, 1000);
    }

    function swapCurrencies() {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        calculateConversion();
    }

    // --- History Management ---
    function saveToHistory(amount, from, result, to) {
        if (amount <= 0) return;

        const newItem = {
            id: Date.now(),
            date: new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
            amount,
            from,
            result,
            to
        };

        // Don't save if it's identical to the very last entry
        if (history.length > 0) {
            const last = history[0];
            if (last.amount === amount && last.from === from && last.to === to) {
                return;
            }
        }

        history.unshift(newItem);
        if (history.length > 10) history.pop();

        localStorage.setItem('currencyHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        while (historyList.firstChild) {
            historyList.removeChild(historyList.firstChild);
        }

        if (history.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No hay conversiones recientes.';
            li.style.color = 'var(--color-text-light)';
            li.style.fontSize = '1.4rem';
            li.style.textAlign = 'center';
            historyList.appendChild(li);
            return;
        }

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';

            const dateSpan = document.createElement('span');
            dateSpan.className = 'history-item-date';
            dateSpan.textContent = item.date;

            const contentSpan = document.createElement('span');

            const amountSpan = document.createElement('span');
            amountSpan.className = 'history-item-amount';
            amountSpan.textContent = `${formatNumber(item.amount)} ${item.from} = `;

            const resultSpan = document.createElement('span');
            resultSpan.className = 'history-item-result';
            resultSpan.textContent = `${formatNumber(item.result)} ${item.to}`;

            contentSpan.appendChild(amountSpan);
            contentSpan.appendChild(resultSpan);

            li.appendChild(dateSpan);
            li.appendChild(contentSpan);

            historyList.appendChild(li);
        });
    }

    function toggleHistory() {
        historySection.classList.toggle('hidden');
        toggleHistoryBtn.classList.toggle('active');
    }

    // --- Utilities ---
    function formatNumber(num, maxDecimals = 2) {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: maxDecimals
        }).format(num);
    }

    function showLoading(show) {
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

    function alertVisual(message) {
        // Fallback visual alert since we can't use alert()
        const oldAlert = document.getElementById('visual-alert');
        if (oldAlert) oldAlert.remove();

        const alertDiv = document.createElement('div');
        alertDiv.id = 'visual-alert';
        alertDiv.textContent = message;
        alertDiv.style.position = 'fixed';
        alertDiv.style.bottom = '2rem';
        alertDiv.style.right = '2rem';
        alertDiv.style.backgroundColor = 'var(--color-primary)';
        alertDiv.style.color = 'white';
        alertDiv.style.padding = '1rem 2rem';
        alertDiv.style.borderRadius = 'var(--radius-md)';
        alertDiv.style.boxShadow = 'var(--shadow-md)';
        alertDiv.style.zIndex = '1000';

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) alertDiv.parentNode.removeChild(alertDiv);
        }, 5000);
    }


    // --- Event Listeners ---
    amountInput.addEventListener('input', calculateConversion);
    fromSelect.addEventListener('change', calculateConversion);
    toSelect.addEventListener('change', calculateConversion);
    swapBtn.addEventListener('click', swapCurrencies);
    toggleHistoryBtn.addEventListener('click', toggleHistory);

    // Bootstrap
    init();
});
