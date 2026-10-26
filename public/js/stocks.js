const input = document.getElementById('stockSearchInput');
const chartTitle = document.getElementById('chartTitle');
const canvas = document.getElementById('stockChart');
const chartRanges = document.getElementById('chartRanges');
const months = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
  '1Y': 12
};

let chart;
let selectedStock;
let timer;
let currentSymbol;
let currentRange = '7D';

input.addEventListener('input', () => {
  clearTimeout(timer);
  selectedStock = null;

  const query = input.value.trim().toLowerCase();
  if (query.length < 2) return;

  timer = setTimeout(async () => {
    const response = await fetch(`/api/stocks?query=${encodeURIComponent(query)}`);
    if (!response.ok) return;

    const stocks = await response.json();

    if (input.value.trim().toLowerCase() !== query) return;

    selectedStock = stocks.find(stock =>
      stock.name.toLowerCase().startsWith(query) ||
      stock.symbol.toLowerCase().startsWith(query)
    );

    if (!selectedStock) return;

    const completion = selectedStock.name.toLowerCase().startsWith(query)
      ? selectedStock.name
      : selectedStock.symbol;

    input.value = completion;
    input.setSelectionRange(query.length, completion.length);
  }, 300);
});

input.addEventListener('keydown', event => {
  if (event.key !== 'Enter') return;

  event.preventDefault();

  if (selectedStock) {
    input.value = selectedStock.name;
    loadStock(selectedStock.symbol);
  }
});

document.querySelector('[data-range="7D"]').classList.add('active');

document.querySelectorAll('[data-range]').forEach(button => {
  button.addEventListener('click', () => {
    if (!currentSymbol) return;

    document.querySelectorAll('[data-range]').forEach(btn => {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    currentRange = button.dataset.range;
    loadStock(currentSymbol);
  });
});

async function loadStock(symbol) {
  currentSymbol = symbol;
  chartTitle.textContent = `Loading ${symbol}...`;

  try {
    const response = await fetch(
      `/api/stocks/${encodeURIComponent(symbol)}/prices?range=${currentRange}`
    );

    if (!response.ok) throw new Error('Failed to load prices');

    const prices = await response.json();
    const filteredPrices = filterPrices(prices, currentRange);

    if (!filteredPrices.length) {
      chartTitle.textContent = 'No price data available.';
      return;
    }

    renderChart(symbol, filteredPrices);

  } catch (error) {
    chartTitle.textContent = 'Unable to load stock prices.';
    console.error(error);
  }
}

function filterPrices(prices, range) {
  if (!prices.length) return [];

  const endDate = new Date(prices[prices.length - 1].time);
  const startDate = new Date(endDate);

  if (range === '7D') {
    startDate.setUTCDate(startDate.getUTCDate() - 7);
  } else {
    startDate.setUTCMonth(startDate.getUTCMonth() - months[range]);
  }

  return prices.filter(price => new Date(price.time) >= startDate);
}

function renderChart(symbol, prices) {
  chartTitle.hidden = false;
  chartTitle.textContent = `${symbol} Closing Prices`;

  if (chart) chart.destroy();

  chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: prices.map(price => price.time),
      datasets: [{
        label: `${symbol} Closing Price`,
        data: prices.map(price => price.value),
        borderColor: 'rgb(75, 192, 192)',
        pointRadius: 0,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 6
          }
        }
      }
    }
  });

  chartRanges.hidden = false;
}
