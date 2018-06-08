function triggerConnector() {
	// reset page content
	document.querySelector('#data').innerHTML = '';
	document.querySelector('#error').innerHTML = '';
	// extract data
	var pageIdsElement = document.querySelector('#pageIds');
	var pageIds;
	try {
		pageIds = JSON.parse(pageIdsElement.value);
	} catch (err) {
		alert('PageIds does not contain valid json.');
		return;
	}
	var dataFormat = document.querySelector('#dataFormat').value;
	// transfer data to component
	var connector = document.querySelector('dbpedialite-connector');
	connector.setDataFormat(dataFormat);
	connector.setPageIds(pageIds);
}

document.addEventListener('cifReady', function () {
	document.querySelector('button').disabled = false;
	document.body.addEventListener('cifModelChange', function (evt) {
		console.log(evt);
		if (evt.detail.slot === 'data') {
			document.querySelector('#data').innerHTML = '<pre>' + JSON.stringify(evt.detail.payload, null, 2) + '</pre>';
			document.querySelector('#error').innerHTML = '';
		}
		if (evt.detail.slot === 'error') {
			document.querySelector('#error').innerHTML = formatError(evt.detail.payload);
			document.querySelector('#data').innerHTML = '';
		}
	});
});

function formatError(value) {
	if (value.errorObj && value.errorObj instanceof XMLHttpRequest) {
		return 'Message: ' + value.message + '<br>Status: ' + value.errorObj.status + '<br>Response:<br>' + value.errorObj.response + '<br>URL: ' + value.errorObj.responseURL;
	} else {
		return '<pre>' + JSON.stringify(value, null, 2) + '</pre>';
	}
}
