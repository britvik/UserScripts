// ==UserScript==
// @name         Remember itstoohard tries
// @description  Shows all attempted tries for all questions so you know what you already tried.
// @author       Bladito
// @version      0.1
// @match        http://www.itstoohard.com/puzzle/*
// @namespace    Bladito/itstoohard-tries
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// ==/UserScript==

(function($) {
    'use strict';

    GM_addStyle('.one-try { margin-left: 1px; line-height: 10px; display: list-item; list-style-position: inside; list-style-type: circle; }');
    onClickSubmit();

})(jQuery);

(function(open) {
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        this.addEventListener("readystatechange", function() {
            if (this.readyState == 4) {
                onClickSubmit();
            }
        }, false);
        open.call(this, method, url, async, user, pass);
    };
})(XMLHttpRequest.prototype.open);

function onClickSubmit() {
    $('input[type="submit"').unbind('click.bladito_hook').bind('click.bladito_hook', function() {
        var $this = $(this);
        var questionNumber = $this.closest('.subBlock').children('.subBlockHeader').text();
        var $triesForQuestion = $('.tries[question="' + questionNumber + '"]');

        console.log('click ' + $this.prev().val());

        if ($triesForQuestion.length) {
            $triesForQuestion.after('<div class="one-try">' + $this.prev().val() + '</div>');
        } else {
            $('#M_Div_BlockHeader').after('<div class="tries-wrap">' + questionNumber + '<div class="tries" question="'+ questionNumber +'"><div class="one-try">' + $this.prev().val() + '</div></div></div>');
        }

    });
}
