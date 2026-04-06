import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeConnectionType,
	NodeOperationError,
	IDataObject,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Authenticate against Kitsu and return a JWT access token */
async function getJwt(
	this: IExecuteFunctions,
	host: string,
	email: string,
	password: string,
): Promise<string> {
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${host}/api/auth/login`,
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
		json: true,
	};
	const response = await this.helpers.httpRequest(options);
	if (!response?.access_token) {
		throw new NodeOperationError(this.getNode(), 'Kitsu login failed — no access_token returned');
	}
	return response.access_token as string;
}

/** Generic Kitsu API call, returns parsed JSON */
async function kitsuRequest(
	this: IExecuteFunctions,
	jwt: string,
	host: string,
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const options: IHttpRequestOptions = {
		method,
		url: `${host}/api${path}`,
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json',
		},
		qs,
		body,
		json: true,
	};

	// DELETE with no body should not send Content-Type
	if (method === 'DELETE' && !body) {
		delete (options.headers as Record<string, string>)['Content-Type'];
	}

	try {
		const resp = await this.helpers.httpRequest(options);
		// Kitsu returns {} on successful DELETE → normalise to an object
		if (resp === undefined || resp === null) return {};
		return resp as IDataObject | IDataObject[];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as unknown as JsonObject);
	}
}

// ─── Option lists ──────────────────────────────────────────────────────────────

const RESOURCES = [
	{ name: 'Asset', value: 'asset' },
	{ name: 'Comment', value: 'comment' },
	{ name: 'Custom Action', value: 'customAction' },
	{ name: 'Episode', value: 'episode' },
	{ name: 'Person', value: 'person' },
	{ name: 'Preview File', value: 'previewFile' },
	{ name: 'Project', value: 'project' },
	{ name: 'Sequence', value: 'sequence' },
	{ name: 'Shot', value: 'shot' },
	{ name: 'Task', value: 'task' },
	{ name: 'Task Status', value: 'taskStatus' },
	{ name: 'Task Type', value: 'taskType' },
];

const CRUD_OPS = [
	{ name: 'Create', value: 'create', action: 'Create' },
	{ name: 'Delete', value: 'delete', action: 'Delete' },
	{ name: 'Get', value: 'get', action: 'Get' },
	{ name: 'Get Many', value: 'getAll', action: 'Get many' },
	{ name: 'Update', value: 'update', action: 'Update' },
];

// ─── Node definition ──────────────────────────────────────────────────────────

export class Kitsu implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kitsu',
		name: 'kitsu',
		icon: 'file:kitsu.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Kitsu/CGWire production management API (Zou)',
		defaults: { name: 'Kitsu' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'kitsuApi',
				required: true,
			},
		],
		properties: [
			// ── Resource ──────────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: RESOURCES,
				default: 'project',
			},

			// ── Operation ─────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: CRUD_OPS,
				default: 'getAll',
				displayOptions: {
					show: {
						resource: [
							'asset', 'episode', 'person', 'project',
							'sequence', 'shot', 'task', 'taskStatus', 'taskType',
						],
					},
				},
			},

			// Comment: limited ops
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Create', value: 'create', action: 'Create a comment' },
					{ name: 'Delete', value: 'delete', action: 'Delete a comment' },
					{ name: 'Get All for Task', value: 'getAllForTask', action: 'Get all comments for a task' },
					{ name: 'Update', value: 'update', action: 'Update a comment' },
				],
				default: 'getAllForTask',
				displayOptions: { show: { resource: ['comment'] } },
			},

			// PreviewFile ops
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Get', value: 'get', action: 'Get a preview file' },
					{ name: 'Get All for Task', value: 'getAllForTask', action: 'Get all preview files for a task' },
				],
				default: 'getAllForTask',
				displayOptions: { show: { resource: ['previewFile'] } },
			},

			// CustomAction: raw API call
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Execute', value: 'execute', action: 'Execute a custom action' }],
				default: 'execute',
				displayOptions: { show: { resource: ['customAction'] } },
			},

			// ── ID field (used by get / update / delete) ───────────────────────
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				description: 'UUID of the record',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
						resource: [
							'asset', 'episode', 'person', 'project',
							'sequence', 'shot', 'task', 'taskStatus', 'taskType',
							'previewFile',
						],
					},
				},
			},

			// ── Task ID (for comments and preview files) ───────────────────────
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['comment', 'previewFile'],
						operation: ['getAllForTask', 'create'],
					},
				},
			},

			// Comment-specific: ID for update / delete
			{
				displayName: 'Comment ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: { resource: ['comment'], operation: ['update', 'delete'] },
				},
			},

			// ── Filters for getAll ─────────────────────────────────────────────
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: { operation: ['getAll'] },
				},
				options: [
					{
						displayName: 'Assignee ID',
						name: 'assignee_id',
						type: 'string',
						default: '',
						description: 'Filter tasks by person UUID',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: { minValue: 1 },
						description: 'Max number of results to return',
						default: 50,
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
					},
					{
						displayName: 'Project ID',
						name: 'project_id',
						type: 'string',
						default: '',
						description: 'Filter results by project UUID',
					},
					{
						displayName: 'Task Status ID',
						name: 'task_status_id',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Task Type ID',
						name: 'task_type_id',
						type: 'string',
						default: '',
					},
				],
			},

			// ── Body fields: Project ───────────────────────────────────────────
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['project'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'End Date', name: 'end_date', type: 'string', default: '', description: 'YYYY-MM-DD' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{
						displayName: 'Production Type',
						name: 'production_type',
						type: 'options',
						options: [
							{ name: 'Short', value: 'short' },
							{ name: 'Feature Film', value: 'featurefilm' },
							{ name: 'TV Show', value: 'tvshow' },
						],
						default: 'short',
					},
					{ displayName: 'Start Date', name: 'start_date', type: 'string', default: '', description: 'YYYY-MM-DD' },
				],
			},

			// ── Body fields: Shot ──────────────────────────────────────────────
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['shot'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'FPS', name: 'fps', type: 'number', default: 24 },
					{ displayName: 'Frame In', name: 'frame_in', type: 'number', default: 0 },
					{ displayName: 'Frame Out', name: 'frame_out', type: 'number', default: 0 },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Project ID', name: 'project_id', type: 'string', default: '' },
					{ displayName: 'Sequence ID', name: 'sequence_id', type: 'string', default: '' },
				],
			},

			// ── Body fields: Asset ─────────────────────────────────────────────
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['asset'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Asset Type ID', name: 'entity_type_id', type: 'string', default: '' },
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Project ID', name: 'project_id', type: 'string', default: '' },
				],
			},

			// ── Body fields: Task ──────────────────────────────────────────────
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Assignee IDs (JSON Array)', name: 'assignees', type: 'string', default: '[]', description: 'E.g. ["uuid1","uuid2"].' },
					{ displayName: 'Due Date', name: 'due_date', type: 'string', default: '', description: 'YYYY-MM-DD' },
					{ displayName: 'Entity ID', name: 'entity_id', type: 'string', default: '', description: 'Shot or Asset UUID' },
					{ displayName: 'Estimate (Days)', name: 'estimation', type: 'number', default: 0 },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Priority', name: 'priority', type: 'number', default: 0 },
					{ displayName: 'Project ID', name: 'project_id', type: 'string', default: '' },
					{ displayName: 'Start Date', name: 'start_date', type: 'string', default: '', description: 'YYYY-MM-DD' },
					{ displayName: 'Task Status ID', name: 'task_status_id', type: 'string', default: '' },
					{ displayName: 'Task Type ID', name: 'task_type_id', type: 'string', default: '' },
				],
			},

			// ── Body fields: Person ────────────────────────────────────────────
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['person'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Active', name: 'active', type: 'boolean', default: true },
					{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '' },
					{ displayName: 'First Name', name: 'first_name', type: 'string', default: '' },
					{ displayName: 'Last Name', name: 'last_name', type: 'string', default: '' },
					{
						displayName: 'Role',
						name: 'role',
						type: 'options',
						options: [
							{ name: 'Admin', value: 'admin' },
							{ name: 'Client', value: 'client' },
							{ name: 'Manager', value: 'manager' },
							{ name: 'Supervisor', value: 'supervisor' },
							{ name: 'User (Artist)', value: 'user' },
							{ name: 'Vendor', value: 'vendor' },
						],
						default: 'user',
					},
				],
			},

			// ── Body fields: Sequence ──────────────────────────────────────────
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['sequence'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Episode ID', name: 'parent_id', type: 'string', default: '' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Project ID', name: 'project_id', type: 'string', default: '' },
				],
			},

			// ── Body fields: Episode ───────────────────────────────────────────
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['episode'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Project ID', name: 'project_id', type: 'string', default: '' },
				],
			},

			// ── Body fields: Comment ───────────────────────────────────────────
			{
				displayName: 'Comment Text',
				name: 'text',
				type: 'string',
				default: '',
				required: true,
				typeOptions: { rows: 4 },
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Task Status ID',
				name: 'task_status_id',
				type: 'string',
				default: '',
				description: 'Change task status when posting this comment',
				displayOptions: {
					show: { resource: ['comment'], operation: ['create'] },
				},
			},

			// ── TaskStatus / TaskType: create/update fields ────────────────────
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['taskStatus'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Color (Hex)', name: 'color', type: 'color', default: '#f5a623' },
					{ displayName: 'Is Artist Allowed', name: 'is_artist_allowed', type: 'boolean', default: true },
					{ displayName: 'Is Client Allowed', name: 'is_client_allowed', type: 'boolean', default: false },
					{ displayName: 'Is Done', name: 'is_done', type: 'boolean', default: false },
					{ displayName: 'Is Reviewable', name: 'is_reviewable', type: 'boolean', default: false },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Short Name', name: 'short_name', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['taskType'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{ displayName: 'Color (Hex)', name: 'color', type: 'color', default: '#bbb' },
					{
						displayName: 'For Entity',
						name: 'for_entity',
						type: 'options',
						options: [
							{ name: 'Asset', value: 'Asset' },
							{ name: 'Edit', value: 'Edit' },
							{ name: 'Episode', value: 'Episode' },
							{ name: 'Sequence', value: 'Sequence' },
							{ name: 'Shot', value: 'Shot' },
						],
						default: 'Shot',
					},
					{ displayName: 'Is Animation', name: 'is_animation', type: 'boolean', default: false },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Priority', name: 'priority', type: 'number', default: 1 },
					{ displayName: 'Short Name', name: 'short_name', type: 'string', default: '' },
				],
			},

			// ── Custom Action (raw API call) ───────────────────────────────────
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				options: [
					{ name: 'DELETE', value: 'DELETE' },
					{ name: 'GET', value: 'GET' },
					{ name: 'PATCH', value: 'PATCH' },
					{ name: 'POST', value: 'POST' },
					{ name: 'PUT', value: 'PUT' },
				],
				default: 'GET',
				displayOptions: { show: { resource: ['customAction'] } },
			},
			{
				displayName: 'Endpoint Path',
				name: 'endpoint',
				type: 'string',
				default: '/data/projects',
				placeholder: '/data/shots/{{shotId}}/tasks',
				description: 'Path relative to /api — e.g. /data/projects or /actions/projects/{ID}/import',
				displayOptions: { show: { resource: ['customAction'] } },
			},
			{
				displayName: 'Query String Parameters',
				name: 'qs',
				type: 'json',
				default: '{}',
				displayOptions: { show: { resource: ['customAction'] } },
			},
			{
				displayName: 'Request Body (JSON)',
				name: 'body',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['customAction'],
						httpMethod: ['POST', 'PUT', 'PATCH'],
					},
				},
			},
		],
	};

	// ── execute ───────────────────────────────────────────────────────────────
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = await this.getCredentials('kitsuApi');
		const host = (credentials.host as string).replace(/\/$/, '');
		const email = credentials.email as string;
		const password = credentials.password as string;

		// Obtain JWT once for the whole execution
		const jwt = await getJwt.call(this, host, email, password);

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let result: IDataObject | IDataObject[] = {};

				// ── resource → endpoint mapping ──────────────────────────────
				const resourcePath: Record<string, string> = {
					asset: '/data/entities',
					episode: '/data/episodes',
					person: '/data/persons',
					project: '/data/projects',
					sequence: '/data/sequences',
					shot: '/data/shots',
					task: '/data/tasks',
					taskStatus: '/data/task-status',
					taskType: '/data/task-types',
					previewFile: '/data/preview-files',
				};

				if (resource === 'customAction') {
					// ── Raw custom call ──────────────────────────────────────
					const method = this.getNodeParameter('httpMethod', i) as string;
					const endpoint = this.getNodeParameter('endpoint', i) as string;
					const rawQs = this.getNodeParameter('qs', i, '{}') as string;
					let qs: IDataObject = {};
					try { qs = JSON.parse(rawQs); } catch { /* ignore */ }

					let body: IDataObject | undefined;
					if (['POST', 'PUT', 'PATCH'].includes(method)) {
						const rawBody = this.getNodeParameter('body', i, '{}') as string;
						try { body = JSON.parse(rawBody); } catch { /* ignore */ }
					}

					result = await kitsuRequest.call(
						this, jwt, host, method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
						endpoint, body, qs,
					);

				} else if (resource === 'comment') {
					// ── Comments ─────────────────────────────────────────────
					const taskId = this.getNodeParameter('taskId', i, '') as string;
					const id = operation !== 'getAllForTask' && operation !== 'create'
						? this.getNodeParameter('id', i, '') as string
						: '';

					if (operation === 'getAllForTask') {
						result = await kitsuRequest.call(this, jwt, host, 'GET', `/data/tasks/${taskId}/comments`);
					} else if (operation === 'create') {
						const text = this.getNodeParameter('text', i) as string;
						const taskStatusId = this.getNodeParameter('task_status_id', i, '') as string;
						const body: IDataObject = { task_id: taskId, text };
						if (taskStatusId) body.task_status_id = taskStatusId;
						result = await kitsuRequest.call(this, jwt, host, 'POST', `/actions/tasks/${taskId}/comment`, body);
					} else if (operation === 'update') {
						const text = this.getNodeParameter('text', i) as string;
						result = await kitsuRequest.call(this, jwt, host, 'PUT', `/data/comments/${id}`, { text });
					} else if (operation === 'delete') {
						result = await kitsuRequest.call(this, jwt, host, 'DELETE', `/data/comments/${id}`);
					}

				} else if (resource === 'previewFile') {
					// ── Preview Files ─────────────────────────────────────────
					if (operation === 'getAllForTask') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						result = await kitsuRequest.call(this, jwt, host, 'GET', `/data/tasks/${taskId}/previews`);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						result = await kitsuRequest.call(this, jwt, host, 'GET', `/data/preview-files/${id}`);
					}

				} else {
					// ── Generic CRUD for all other resources ──────────────────
					const basePath = resourcePath[resource];

					if (operation === 'getAll') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = {};
						for (const [k, v] of Object.entries(filters)) {
							if (v !== '' && v !== undefined) qs[k] = v;
						}
						result = await kitsuRequest.call(this, jwt, host, 'GET', basePath, undefined, qs);

					} else if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						result = await kitsuRequest.call(this, jwt, host, 'GET', `${basePath}/${id}`);

					} else if (operation === 'create') {
						const fields = this.getNodeParameter('fields', i, {}) as IDataObject;
						const body = buildBody(fields);
						result = await kitsuRequest.call(this, jwt, host, 'POST', basePath, body);

					} else if (operation === 'update') {
						const id = this.getNodeParameter('id', i) as string;
						const fields = this.getNodeParameter('fields', i, {}) as IDataObject;
						const body = buildBody(fields);
						result = await kitsuRequest.call(this, jwt, host, 'PUT', `${basePath}/${id}`, body);

					} else if (operation === 'delete') {
						const id = this.getNodeParameter('id', i) as string;
						result = await kitsuRequest.call(this, jwt, host, 'DELETE', `${basePath}/${id}`);
					}
				}

				// Normalise: array → multiple items, object → single item
				if (Array.isArray(result)) {
					for (const item of result) {
						returnData.push({ json: item });
					}
				} else {
					returnData.push({ json: result });
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Strip empty-string values and parse JSON strings where needed */
function buildBody(fields: IDataObject): IDataObject {
	const out: IDataObject = {};
	for (const [k, v] of Object.entries(fields)) {
		if (v === '' || v === undefined) continue;
		// Attempt to parse JSON array/object strings (e.g. assignees)
		if (typeof v === 'string' && (v.startsWith('[') || v.startsWith('{'))) {
			try {
				out[k] = JSON.parse(v);
				continue;
			} catch { /* keep as string */ }
		}
		out[k] = v;
	}
	return out;
}
