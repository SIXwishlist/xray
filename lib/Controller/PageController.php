<?php
/**
 * @author Robin Appelman <icewind@owncloud.com>
 *
 * @copyright Copyright (c) 2016, ownCloud, Inc.
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

namespace OCA\XRay\Controller;

use OC\Security\CSP\ContentSecurityPolicy;
use OCA\XRay\EventSource;
use OCA\XRay\Queue\DatabaseLog;
use OCA\XRay\Queue\IQueue;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Controller;
use OCP\IRequest;

class PageController extends Controller {
	/** @var  IQueue */
	private $queue;
	/** @var DatabaseLog */
	private $log;

	public function __construct($AppName, IRequest $request, IQueue $queue, DatabaseLog $log) {
		parent::__construct($AppName, $request);
		$this->queue = $queue;
		$this->log = $log;
	}

	/**
	 * @param string $before
	 * @return array
	 */
	public function history($before = '') {
		return $this->log->getHistory($before);
	}

	/**
	 * @param string $since
	 * @return array
	 */
	public function since($since = '') {
		return $this->log->getSince($since);
	}

	/**
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index() {
		$response = new TemplateResponse(
			$this->appName,
			'index',
			[
				'appId' => $this->appName
			]
		);

		$csp = new ContentSecurityPolicy();
		$csp->addAllowedConnectDomain($this->request->getServerHost() . ':3003');
		$response->setContentSecurityPolicy($csp);

		return $response;
	}
}
