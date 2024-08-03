document.getElementById('track-stock').addEventListener('click', () => {
  let symbol = document.getElementById('stock-symbol').value.toUpperCase();
  if (symbol) {
    chrome.runtime.sendMessage({ action: 'getStockPrice', symbol: symbol }, (response) => {
      if (response && response.price) {
        chrome.storage.local.get('stockData', (data) => {
          if (!data.stockData) data.stockData = {};
          if (!data.stockData[symbol]) data.stockData[symbol] = { history: [] };
          data.stockData[symbol].history.push({ date: new Date().toISOString(), price: response.price });
          chrome.storage.local.set({ stockData: data.stockData }, () => {
            alert('Stock tracking started for ' + symbol);
            displayPriceHistory(symbol);
          });
        });
      }
    });
  }
});

function displayPriceHistory(symbol) {
  chrome.storage.local.get('stockData', (data) => {
    let ctx = document.getElementById('price-history').getContext('2d');
    let history = data.stockData[symbol].history;
    let labels = history.map(entry => new Date(entry.date).toLocaleDateString());
    let prices = history.map(entry => entry.price);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Price History',
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      }
    });
  });
}
