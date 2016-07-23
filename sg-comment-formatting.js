// ==UserScript==
// @name         SteamGifts comment formatting
// @description  Adds some buttons to help you with formatting your comments.
// @author       Bladito
// @version      0.2
// @match        https://www.steamgifts.com/*
// @namespace    Bladito/sg-comment-formatting
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// ==/UserScript==

(function($) {
    'use strict';

    var commentTextareas = $('textarea[name="description"]');

    if (commentTextareas.length) {
        enrichJquery();
        addStyles();
        addControls();
    }

    //--------------------------------------------------------------------------------------------------

    function addControls() {
        addWrappingFormatter('<i class="fa fa-italic"></i>', 'Italics', '*');
        addWrappingFormatter('<i class="fa fa-bold"></i>', 'Bold', '**');
        addWrappingFormatter('<i class="fa fa-italic"></i><i class="fa fa-bold"></i>', 'Italics and bold', '***');
        addWrappingFormatter('<i class="fa fa-low-vision"></i>', 'Spoiler', '~');
        addWrappingFormatter('<i class="fa fa-strikethrough"></i>', 'Strike through', '~~');

        commentTextareas.on('paste', handlePastedURL);
    }

    function addWrappingFormatter(buttonText, title, wrappingCharacters) {
        var bold = $('<button type="button" class="bsg-formatting-btn" title="' + title + '">' + buttonText + '</button>');
        bold.on('click', function() {
            insertToTextarea($(this).siblings('textarea'), wrappingCharacters, undefined, wrappingCharacters, function(textarea, textSelection) {
                textarea.bsgSelectRange(textSelection.start + wrappingCharacters.length, textSelection.end + wrappingCharacters.length);
            });
        });
        commentTextareas.before(bold);
    }

    function handlePastedURL(e) {
        var preChars, pastedData = (e.originalEvent || e).clipboardData.getData('text/plain');

        if (pastedData) {
            if (/^https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^/#?]+)+/i.test(pastedData)) {
                preChars = '[](';
                if (/^.*\.(?:jpe?g|gif|png)$/i.test(pastedData)) {
                    preChars = '!' + preChars;
                }
            }
            if (preChars) {
                e.stopPropagation();
                e.preventDefault();
                insertToTextarea($(e.target), preChars, pastedData, ')', function(textarea, textSelection) {
                    textarea.bsgSelectRange(textSelection.start + (preChars.length === 3 ? 1 : 2));
                });
            }
        }
    }

    function insertToTextarea(commentTextarea, preChars, textBetween, postChars, callback) {
        var newText, text = commentTextarea.val();
        var textSelection = commentTextarea.bsgGetSelection();

        newText = text.slice(0,textSelection.start) + preChars + (textBetween || textSelection.text) + postChars + text.slice(textSelection.end);
        commentTextarea.val(newText);
        callback(commentTextarea, textSelection);
    }

    function enrichJquery() {
        $.fn.bsgSelectRange = function(start, end) {
            if(end === undefined) {
                end = start;
            }
            return this.each(function() {
                this.focus();
                if('selectionStart' in this) {
                    this.selectionStart = start;
                    this.selectionEnd = end;
                } else if(this.setSelectionRange) {
                    this.setSelectionRange(start, end);
                } else if(this.createTextRange) {
                    var range = this.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', start);
                    range.select();
                }
            });
        };
        //copied from https://github.com/localhost/jquery-fieldselection/blob/master/jquery-fieldselection.js
        $.fn.bsgGetSelection = function() {
            var e = (this.jquery) ? this[0] : this;
            return (
                /* mozilla / dom 3.0 */
                ('selectionStart' in e && function() {
                    var l = e.selectionEnd - e.selectionStart;
                    return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
                }) ||

                /* exploder */
                (document.selection && function() {
                    e.focus();
                    var r = document.selection.createRange();
                    if (r === null) {
                        return { start: 0, end: e.value.length, length: 0 };
                    }

                    var re = e.createTextRange();
                    var rc = re.duplicate();
                    re.moveToBookmark(r.getBookmark());
                    rc.setEndPoint('EndToStart', re);

                    return { start: rc.text.length, end: rc.text.length + r.text.length, length: r.text.length, text: r.text };
                }) ||

                /* browser not supported */
                function() { return null; }
            )();
        };
    }

    function addStyles() {
        GM_addStyle('.bsg-formatting-btn { ' +
                    'display: inline-block;' +
                    'margin: 1px;' +
                    'border: 1px solid #d6d6d6;' +
                    'font: 700 13px/20px "Open Sans",sans-serif;' +
                    'cursor: pointer;' +
                    'text-align: center;' +
                    'border-radius: 4px;' +
                    'background-color: #f3f3f3;' +
                    'background-image: none;' +
                    'color: #757575;' +
                    'width: 22px;' +
                    '}');
        GM_addStyle('.bsg-formatting-btn:hover {' +
                    'border-color: #B9D393 #96BC69 #73A442 #A0C870;' +
                    'background-image: linear-gradient(#cef2aa 0%, #b4e08a 50%, #9AC96A 100%);' +
                    'background-image: -moz-linear-gradient(#cef2aa 0%, #b4e08a 50%, #9AC96A 100%);' +
                    'background-image: -webkit-linear-gradient(#cef2aa 0%, #b4e08a 50%, #9AC96A 100%);' +
                    '}');
    }

})(jQuery);
