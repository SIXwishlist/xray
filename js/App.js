import {Component} from 'react';

import {
	SideBar,
	Entry,
	Separator,
	App as AppContainer,
	Content,
	ControlBar,
	Settings
} from 'oc-react-components';

import DataProvider from './DataProvider';

import {ToggleEntry} from './Components/ToggleEntry';

import Lock from './Pages/Lock';
import Storage from './Pages/Storage';
import Request from './Pages/Request';
import Cache from './Pages/Cache';

import style from '../css/app.less';

export class App extends Component {
	live = true;
	locks = [];
	storage = [];
	cache = [];
	requests = [];
	pause = false;

	state = {
		live: true,
		filter: '',
		page: 'request', // lazy mans routing
		locks: [],
		storage: [],
		requests: [],
		cache: []
	};

	constructor () {
		super();
		this.source = new DataProvider();
	}

	initRequest (request) {
		if (!this.requests[request]) {
			this.requests[request] = {
				id: request,
				time: 0,
				path: '',
				locks: [],
				storage: [],
				cache: []
			};
		}
	}

	updateState = _.throttle(() => { //batch state updates
		if (this.live) {
			this.setState({
				locks: this.locks,
				requests: this.requests,
				storage: this.storage,
				cache: this.cache
			});
		}
	}, 100);

	componentDidMount () {
		this.source.listen((lock) => {
			this.locks.unshift(lock);
			this.initRequest(lock.request);
			this.requests[lock.request].locks.push(lock);
			this.updateState();
		}, storageOperation => {
			this.storage.unshift(storageOperation);
			this.initRequest(storageOperation.request);
			this.requests[storageOperation.request].storage.push(storageOperation);
			this.updateState();
		}, request => {
			this.initRequest(request.id);
			Object.assign(this.requests[request.id], request);
		}, cacheOperation => {
			this.cache.unshift(cacheOperation);
			this.initRequest(cacheOperation.request);
			this.requests[cacheOperation.request].cache.push(cacheOperation);
			this.updateState();
		});
	}

	onClick (page, e) {
		e.preventDefault();
		if (this.state.page !== page) {
			this.setState({
				page: page
			});
		}
	}

	toggleLive = (live) => {
		this.live = live;
		if (live) {
			this.updateState();
		}
	};

	onFilterChange (event) {
		this.setState({filter: event.target.value});
	}

	getRequests () {
		return Object.values(this.state.requests).sort((a, b)=>b.time - a.time);
	}

	render () {
		let page;
		switch (this.state.page) {
			case 'request':
				page = <Request filter={this.state.filter}
								toggleLive={this.toggleLive}
								items={this.getRequests()}/>;
				break;
			case 'lock':
				page =
					<Lock filter={this.state.filter} items={this.state.locks}/>;
				break;
			case 'storage':
				page = <Storage filter={this.state.filter}
								items={this.state.storage}/>;
				break;
			case 'cache':
				page = <Cache filter={this.state.filter}
							  items={this.state.cache}/>;
				break;
			default:
				page = <div>Unknown page</div>;
		}

		return (
			<AppContainer appId="xray">
				<SideBar withIcon={true}>
					<ToggleEntry onChange={this.toggleLive.bind(this)}
								 active={this.live}>Live
						Updates</ToggleEntry>
					<Separator/>
					<Entry key={1}
						   onClick={this.onClick.bind(this,'request')}>Requests</Entry>
					<Entry key={2}
						   onClick={this.onClick.bind(this,'lock')}>Locks</Entry>
					<Entry key={3}
						   onClick={this.onClick.bind(this,'storage')}>Storage</Entry>
					<Entry key={4}
						   onClick={this.onClick.bind(this,'cache')}>Cache</Entry>
				</SideBar>

				<ControlBar>
					<div className={style.filterWrapper}>
						<input className={style.filter} type="text"
							   placeholder="Filter path..."
							   onChange={this.onFilterChange.bind(this)}/>
					</div>
				</ControlBar>

				<Content>
					{page}
				</Content>
			</AppContainer>
		);
	}
}
