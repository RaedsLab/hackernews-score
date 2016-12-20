function DOMtoString(document_root) {
  return document.body.outerHTML ;
}

chrome.extension.sendMessage({
  action: 'getSource',
  source: DOMtoString(document)
});