/*function extractPrice() {
    let priceElement = document.querySelector('.Trsdu(0.3s) Fw(b) Fz(36px) Mb(-4px) D(ib)');
    return priceElement ? parseFloat(priceElement.textContent.replace(/,/g, '')) : null;
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStockPrice') {
      let price = extractPrice();
      sendResponse({ price: price });
    }
  });*/

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractPrice') {
      let priceElement = document.querySelector('.Trsdu(0.3s).Fw(b).Fz(36px).Mb(-4px).D(ib)');
      let price = priceElement ? parseFloat(priceElement.textContent.replace(/,/g, '')) : null;
      sendResponse({ price });
    }
  });
  
  