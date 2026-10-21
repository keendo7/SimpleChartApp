const input = document.getElementById('stockSearchInput');
const chartTitle = document.getElementById('chartTitle');
const canvas = document.getElementById('stockChart');

let chart;
let selectedStock;
let timer;

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

async function loadStock(symbol) {
  chartTitle.textContent = `Loading ${symbol}...`;

  try {
    const response = await fetch(
      `/api/stocks/${encodeURIComponent(symbol)}/prices`
    );

    if (!response.ok) throw new Error('Failed to load prices');

    const prices = await response.json();

    if (!prices.length) {
      chartTitle.textContent = 'No price data available.';
      return;
    }

    renderChart(symbol, prices);

  } catch (error) {
    chartTitle.textContent = 'Unable to load stock prices.';
    console.error(error);
  }
}

function renderChart(symbol, prices) {
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
      maintainAspectRatio: false
    }
  });
}
