let stockData = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('checkStockPrices', { periodInMinutes: 60 }); // Check every hour
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkStockPrices') {
    checkStockPrices();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStockPrice') {
    let stockSymbol = request.symbol;
    fetchStockPrice(stockSymbol, sendResponse);
    return true; // Will respond asynchronously
  } else if (request.action === 'stockPriceResult') {
    handleStockPriceResult(request.result);
  }
});

function fetchStockPrice(symbol, callback) {
  chrome.tabs.create({ url: `https://finance.yahoo.com/quote/${symbol}`, active: false }, (tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tab.id, { action: 'extractPrice' }, (result) => {
        callback(result);
        chrome.tabs.remove(tab.id);
      });
    });
  });
}

function checkStockPrices() {
  for (let symbol in stockData) {
    fetchStockPrice(symbol, (response) => {
      if (response.price) {
        let history = stockData[symbol].history;
        let lastPrice = history[history.length - 1].price;
        if (response.price < lastPrice) {
          chrome.notifications.create('', {
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Price Drop Alert!',
            message: `${symbol} price dropped from ${lastPrice} to ${response.price}.`
          });
        }
        history.push({ date: new Date().toISOString(), price: response.price });
        chrome.storage.local.set({ stockData: stockData });
      }
    });
  }
}

function handleStockPriceResult(result) {
  if (result && result.price) {
    let symbol = result.symbol;
    if (!stockData[symbol]) {
      stockData[symbol] = { history: [] };
    }
    stockData[symbol].history.push({ date: new Date().toISOString(), price: result.price });
    chrome.storage.local.set({ stockData: stockData });
  }
}
