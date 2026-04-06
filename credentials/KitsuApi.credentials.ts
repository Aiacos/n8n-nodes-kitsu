import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KitsuApi implements ICredentialType {
	name = 'kitsuApi';
	displayName = 'Kitsu API';
	documentationUrl = 'https://zou.cg-wire.com/api/';
	icon = 'file:kitsu.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Kitsu Host URL',
			name: 'host',
			type: 'string',
			default: 'https://kitsu.example.com',
			placeholder: 'https://your-kitsu-instance.com',
			description: 'The base URL of your Kitsu/Zou instance (no trailing slash)',
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			typeOptions: { password: false },
			default: '',
			description: 'Your Kitsu account email address',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Kitsu account password',
		},
	];

	// n8n will inject the JWT automatically via the authenticate method.
	// We use a custom authenticate flow inside the node itself because
	// Kitsu requires a two-step auth (POST /auth/login → get JWT → inject Bearer).
	// The generic IAuthenticateGeneric below handles simple bearer injection
	// once the node retrieves the token.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.access_token}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}/api',
			url: '/auth/authenticated',
			method: 'GET',
		},
	};
}
