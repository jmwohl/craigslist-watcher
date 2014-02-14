var config = {};

config.from = {
	email: 'example@example.com',
	pass: 'password'
};

config.to = {
	email: 'to@address.com'
};

config.searches = [{
	location: 'newyork',	// location to search
	category: 'zip',		// cl code for the category (zip is free) - defaults to 'sss' (all for sale)
	term: 'cubicle',		// term to search on
	nearby: true			// include nearby results? - defaults to false
}];

module.exports = config;