var config = {};

config.smtp = {
	address: 'example@example.com',
	pass: 'password'
};

config.to = {
	email: 'to@address.com'
};

config.searches = [{
	location: 'newyork',
	category: 'zip',
	term: 'cubicle',
	nearby: true
}];

module.exports = config;