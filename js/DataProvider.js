import EventSource from 'event-source';

export default class DataProvider {
	listening = false;
	source = null;
	callBacks = {};

	lastRequest = '';
	requestCounter = 0;

	getHistory () {
		const {lockCb, storageCb, requestCb, cacheCb, queryCb} = this.callBacks;
		$.get(OC.generateUrl(`/apps/xray/history`)).then(items => {
			items.forEach(item => {
				switch (item.type) {
					case 'request':
						this.onRequest(requestCb, item.data);
						break;
					case 'storage':
						this.onRequest(storageCb, item.data);
						break;
					case 'lock':
						this.onRequest(lockCb, item.data);
						break;
					case 'cache':
						this.onRequest(cacheCb, item.data);
						break;
					case 'query':
						this.onRequest(queryCb, item.data);
				}
			});
		});
	}

	listen (lockCb, storageCb, requestCb, cacheCb, queryCb, allowLiveCb) {
		if (this.listening) {
			return;
		}
		this.callBacks = {lockCb, storageCb, requestCb, cacheCb, queryCb};
		this.listening = true;

		const source = new EventSource(`//${window.location.hostname}:3003`);
		source.onerror = () => {
			source.close();
			allowLiveCb(false);
			this.getHistory();
		};
		source.addEventListener('lock', (e) => {
			this.onRequest(lockCb, JSON.parse(e.data));
		});
		source.addEventListener('storage', (e) => {
			this.onRequest(storageCb, JSON.parse(e.data));
		});
		source.addEventListener('cache', (e) => {
			this.onRequest(cacheCb, JSON.parse(e.data));
		});
		source.addEventListener('request', (e) => {
			allowLiveCb(true);
			this.onRequest(requestCb, JSON.parse(e.data));
		});
		source.addEventListener('query', (e) => {
			this.onRequest(queryCb, JSON.parse(e.data));
		});
		this.source = source;
		return source;
	}

	onRequest (cb, data) {
		if (this.listening) {
			cb(data);
		}
	}

	onLock (cb, data) {
		if (this.listening) {
			if (data.request !== this.lastRequest) {
				this.requestCounter = 1 - this.requestCounter;
				this.lastRequest = data.request;
			}
			data.requestCounter = this.requestCounter;
			cb(data);
		}
	}

	onStorage (cb, data) {
		if (this.listening) {
			if (data.request !== this.lastRequest) {
				this.requestCounter = 1 - this.requestCounter;
				this.lastRequest = data.request;
			}
			data.requestCounter = this.requestCounter;
			cb(data);
		}
	}

	onCache (cb, data) {
		if (this.listening) {
			if (data.request !== this.lastRequest) {
				this.requestCounter = 1 - this.requestCounter;
				this.lastRequest = data.request;
			}
			data.requestCounter = this.requestCounter;
			cb(data);
		}
	}

	onQuery (cb, data) {
		if (this.listening) {
			if (data.request !== this.lastRequest) {
				this.requestCounter = 1 - this.requestCounter;
				this.lastRequest = data.request;
			}
			data.requestCounter = this.requestCounter;
			cb(data);
		}
	}

	stopListening () {
		this.listening = false;
	}
}
