import {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KitsuApi implements ICredentialType {
	name = 'kitsuApi';
	displayName = 'Kitsu API';
	documentationUrl = 'https://api-docs.kitsu.cloud/';
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
			placeholder: 'name@email.com',
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

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}/api',
			url: '/auth/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: '=email={{encodeURIComponent($credentials.email)}}&password={{encodeURIComponent($credentials.password)}}',
		},
	};
}
