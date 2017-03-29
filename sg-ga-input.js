// ==UserScript==
// @name         SteamGifts GA input
// @description  Adds input on top menu where you can enter 5characters of GA id and it will open the GA page for you.
// @author       Bladito
// @version      0.1.0
// @homepageURL  https://greasyfork.org/en/users/55159-bladito
// @match        https://www.steamgifts.com/*
// @namespace    Bladito/sg-ga-input
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// ==/UserScript==

(function($) {
    'use strict';

    var $input = $('<input id="bsg-ga-input">');
    $input.on('input', function(event) {
        var value = event.target.value;
        if (value.length === 5) {
            window.open('https://www.steamgifts.com/giveaway/'+value+'/', '_blank');
        }
    });
    $('.nav__left-container').append($input);

    addStyles();

    //---------------------------------------------------------------------------------

    function addStyles() {
        GM_addStyle('#bsg-ga-input { ' +
                    'width: 100px;' +
                    'color: white;' +
                    'background-color: #3d434f;' +
                    'border: 1px solid #6e7788;' +
                    '}');
        GM_addStyle('#bsg-ga-input:focus { ' +
                    'color: black;' +
                    'background-color: white;' +
                    '}');
    }

})(jQuery);
