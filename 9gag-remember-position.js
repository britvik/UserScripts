// ==UserScript==
// @name         9gag remember position
// @description  If you scroll down and then close your browser, you lose your scrolling progress. This script adds one magical button, that remembers the position for you as bookmarkable link. Easily allowing you to continue where you left off.
// @author       Bladito
// @version      0.2.3
// @homepageURL  https://greasyfork.org/en/users/55159-bladito
// @match        *://9gag.com/*
// @namespace    Bladito/9gag
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// ==/UserScript==

(function($) {
    'use strict';

    detectAdditionInDOM($('.main-wrap').get(0), function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node && node.tagName === 'ARTICLE') {
                        addRememberButton($(node));
                    }
                });
            }
        });
    });

    function addRememberButton($target) {
        if ($target.prevAll().length >= 3) {
            var prev1 = $target.prev();
            var prev2 = prev1.prev();
            var prev3 = prev2.prev();
            var url = [location.protocol, '//', location.host, location.pathname].join('');
            var params = '?id='+getId(prev1)+'%2C'+getId(prev2)+'%2C'+getId(prev3)+'&c=10';
            $target.find('.share.right:not(:has(>.b9g-remember-btn)) ul').prepend('<li class="btn-vote"><a class="b9g-remember-btn" title="Remember position" href="'+url+params+'" rel="nofollow"></a></li>');
        }
        function getId(el) {
            return el.attr('id').replace('jsid-entry-entity-', '');
        }
    }

    function detectAdditionInDOM(node, callback) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        if (node) {
            if (MutationObserver) {
                var obs = new MutationObserver(function(mutations, observer) {
                    if(mutations[0].addedNodes.length) {
                        callback(mutations);
                    }
                });
                obs.observe(node, { childList:true, subtree:true });
            } else if (window.addEventListener) {
                node.addEventListener('DOMNodeInserted', callback, false);
            }
        }
    }
    GM_addStyle('.b9g-remember-btn:after {' +
                'position: absolute;' +
                'content: " ";' +
                'width: 30px;' +
                'height: 30px;' +
                'left: 50%;' +
                'top: 50%;' +
                'margin-top: -15px;' +
                'margin-left: -15px;' +
                'background: #fff url(http://assets-9gag-fun.9cache.com/s/fab0aa49/2be0fee1ca1689308b4eb2487fb403f99b48399e/static/dist/web6/img/sprite.png) -72px -8px no-repeat;' +
                'background-size: 280px 90px;' +
                '}');

})(jQuery);
