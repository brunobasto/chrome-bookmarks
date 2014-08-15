YUI().use('event-valuechange', 'node', 'selector-css3', 'yui-later', function (Y) {
	var bodyNode = Y.one(document.body),
		focusedNode,
		queryNode = Y.one('#query'),
		resultsNode = Y.one('#results'),
		rendered = {},
		searchHandler;

	var searchFn = function(event) {
		if (searchHandler) {
			searchHandler.cancel();
		}

		searchHandler = Y.later(175, window, function() {
			chrome.bookmarks.search(
				event.newVal,
				function(result) {
					var matched = {};

					Y.Array.each(
						result,
						function(item) {
							matched[item.url] = 1;

							if (!rendered[item.url]) {
								var entry = Y.Node.create('<a data-url="' + item.url + '" href="javascript:;"><strong>' + item.title + '</strong><br /><span class="muted">' + item.url + '</span></a>');

								rendered[item.url] = entry;

								resultsNode.append(entry);
							}
							else {
								rendered[item.url].removeClass('yui3-helper-hidden');
							}
						}
					);

					Y.each(
						rendered,
						function(item, index) {
							if (!matched[index]) {
								item.addClass('yui3-helper-hidden');
							}
						}
					);

					focusedNode = resultsNode.one('a:not(.yui3-helper-hidden)');

					if (focusedNode) {
						focusedNode.focus();
					}
				}
			);
		}, [], false);
	};

	queryNode.on('valuechange', searchFn);

	bodyNode.on(
		'keydown',
		function(event) {
			if (event.keyCode === 38 || event.keyCode === 40) {
				var nodeToFocus;

				if (focusedNode) {
					// Up
					if (event.keyCode === 38) {
						nodeToFocus = focusedNode.previous('a:not(.yui3-helper-hidden)');
					}
					// Down
					else if (event.keyCode === 40) {
						nodeToFocus = focusedNode.next('a:not(.yui3-helper-hidden)');
					}
				}
				else {
					nodeToFocus = resultsNode.one('a:not(.yui3-helper-hidden)');
				}

				if (nodeToFocus) {
					focusedNode = nodeToFocus.focus();
				}

				event.preventDefault();
			}
			else if (event.keyCode !== 13) {
				queryNode.focus();

				focusedNode = null;
			}
		}
	);

	resultsNode.delegate(
		'click',
		function(event) {
			var url = event.currentTarget.getAttribute('data-url');

			chrome.tabs.create({url: url});
		},
		'a'
	);

	resultsNode.delegate(
		'mouseenter',
		function(event) {
			event.currentTarget.focus();
		},
		'a'
	);
});