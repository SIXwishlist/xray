import {Component} from 'react';

import ReactList from 'react-list'
import Timestamp from 'react-time';
import LockType from '../Components/LockType';
import EventType from '../Components/LockEventType';
import LockState from '../Components/LockState';
import style from './Lock.less';

class LockRow extends Component {
	state = {
		showState: false
	};

	render = () => {
		const key = this.props.rowKey;
		const entry = this.props.lock;
		const onClick = (entry.event === 'error') ? function () {
		} : () => {
			this.setState({showState: !this.state.showState})
		};
		const className = (!entry.success) ? style.error : '';
		const event = entry.operation;
		let state = '';
		if (this.state.showState) {
			state = (<LockState locks={this.props.locks} lock={this.props.lock}/>);
		}
		return (
			<tr key={key} className={className}
				onClick={onClick}>
				<td className={style.time}><Timestamp
					value={entry.time * 1000}
					relative
					titleFormat="HH:mm:ss.SSS"/>
				</td>
				<td className={style.event}>
					<EventType type={event}/>
				</td>
				<td className={style.path}>
					{entry.path}
					{state}
				</td>
				<td className={style.type}>
					<LockType type={entry.type}/>
				</td>
			</tr>
		)
	};
}

export default class Lock extends Component {
	renderRow = (index, key) => {
		return (
			<LockRow rowKey={key} locks={this.props.locks} lock={this.props.locks[index]}/>
		);
	};

	renderer = (items, ref) => {
		return (<table className={style.lockTable}>
			<thead>
			<tr>
				<th className={style.time}>Time</th>
				<th className={style.event}>Event</th>
				<th className={style.path}>Path</th>
				<th className={style.type}>Type</th>
			</tr>
			</thead>
			<tbody ref={ref}>
			{items}
			</tbody>
		</table>);
	};

	render () {
		return (
			<ReactList
				itemRenderer={this.renderRow}
				itemsRenderer={this.renderer}
				length={this.props.locks.length}
				type='uniform'
			/>
		);
	}
}