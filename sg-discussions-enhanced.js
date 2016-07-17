// ==UserScript==
// @name         SG discussions enhanced
// @description  Automatically mark read discussions, show count of new comments since last read, show if post title changed, manually mark one post or all posts of user
// @author       Bladito
// @version      0.5
// @match        https://www.steamgifts.com/discussion*
// @namespace    Bladito/sg-discussions
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// ==/UserScript==

(function($) {
    'use strict';

    var storageName = 'Bladito_sg_discussions-read',     // discussions that user already read - saved automatically
        stalkedStorageName = 'Bladito_sg_discussions-stalked-users', // stlaked users (all their discussions will be highlighted) - saved manually
        markedDiscussionsStorageName = 'Bladito_sg_discussions-marked'; // marked discussions (highligted speciffic discussions) - saved manually

    addStyles();

    var discussionMatch = matchDiscussion(location.href);
    var discussionsMatch = location.href.match(/.*\/discussions\/?/);

    if (discussionMatch !== null) {
        rememberReadDiscussion(discussionMatch);
    } else if (discussionsMatch !== null) {
        markReadDiscussions();
    }

    //-------------------------------------------------------------------------------------------------------------------------------------------------

    function matchDiscussion(url) {
        return url.match(/.*\/discussion\/(.*)\/(.*)/);
    }

    function rememberReadDiscussion(discussionMatch) {
        var discussion = {
            name: discussionMatch[2],
            comments: getCommentsCount(),
            time: new Date().getTime()
        };
        addReadDiscussion(discussionMatch[1], discussion);
    }

    function getCommentsCount() {
        return parseNumberFromElement($('.page__heading__breadcrumbs:eq(1)').children());
    }

    function parseNumberFromElement(element) {
        return parseInt(element.text().replace(/[^0-9]/g, ''));
    }

    function markReadDiscussions() {
        var linkDiscussionMatch, $this, $outerWrap, $buttonsWrap, $commentsCountElement, commentsCount, newCommentsCount, newCommentsStyles, originalPoster,
            readDiscussion, readDiscussions = getReadDiscussions(), stalkedUsers = getStalkedUsers(), markedDiscussions = getMarkedDiscussions();

        if (readDiscussions) {
            $('a.table__column__heading').each(function() {
                $this = $(this);
                $outerWrap = $this.closest('.table__row-outer-wrap');
                linkDiscussionMatch = matchDiscussion(this.href);
                readDiscussion = readDiscussions[linkDiscussionMatch[1]];

                if (readDiscussion) { //we have read this discussion already
                    $outerWrap.css({
                        opacity: 0.3,
                        margin: '0 -20px 0 20px'
                    });
                    if (readDiscussion.name !== linkDiscussionMatch[2]) { //OP changed discussion name
                        $this.css('color', '#fd00ff');
                        $this.attr('title', 'Changed from: "' + readDiscussion.name + '"');
                    }
                    $commentsCountElement = $outerWrap.find('.table__column--width-small .table__column__secondary-link');
                    commentsCount = parseNumberFromElement($commentsCountElement);
                    if (readDiscussion.comments !== commentsCount) {
                        newCommentsCount = commentsCount - readDiscussion.comments;
                        newCommentsStyles = getStylesForNewComments(newCommentsCount);
                        $commentsCountElement.after('<span style="'+newCommentsStyles.section+'"><span style="'+newCommentsStyles.number+'">(+'+newCommentsCount+')</span></span>');
                    }
                }
                originalPoster = $outerWrap.find('.table__column--width-fill .table__column__secondary-link:eq(1)').text();

                $buttonsWrap = $('<div class="action-btns-wrap"></div>');
                $outerWrap.prepend($buttonsWrap);

                if (stalkedUsers.indexOf(originalPoster) > -1) {
                    markPostOfStalkedUser($outerWrap);
                    addUnstalkButton($buttonsWrap, $outerWrap, originalPoster);
                } else {
                    addStalkButton($buttonsWrap, $outerWrap, originalPoster);
                }

                if (markedDiscussions.indexOf(linkDiscussionMatch[1]) > -1) {
                    markDiscussion($outerWrap);
                    addUnmarkButton($buttonsWrap, $outerWrap, linkDiscussionMatch[1]);
                } else {
                    addMarkButton($buttonsWrap, $outerWrap, linkDiscussionMatch[1]);
                }
            });
        }
    }

    function addStalkButton($buttonsWrap, $outerWrap, originalPoster) {
        var stalkButton = $('<button class="bsg-action-btn" title="stalk = every post of this user will be highlighted"><i class="fa fa-eye"></i></button></div>');
        $buttonsWrap.append(stalkButton);
        stalkButton.on('click', function() {
            addOrRemoveStalkedUser(originalPoster,$outerWrap);
            stalkButton.remove();
            addUnstalkButton($buttonsWrap, $outerWrap, originalPoster);
        });
    }
    function addUnstalkButton($buttonsWrap, $outerWrap, originalPoster) {
        var unstalkButton = $('<button class="bsg-action-btn m-active" title="unstalk = every post of this user will not be highlighted anymore"><i class="fa fa-eye-slash"></i></button></div>');
        $buttonsWrap.append(unstalkButton);
        unstalkButton.on('click', function() {
            addOrRemoveStalkedUser(originalPoster,$outerWrap);
            unstalkButton.remove();
            addStalkButton($buttonsWrap, $outerWrap, originalPoster);
        });
    }

    function addMarkButton($buttonsWrap, $outerWrap, discussionId) {
        var markButton = $('<button class="bsg-action-btn" title="mark = highlight this post"><i class="fa fa-paint-brush"></i></button>');
        $buttonsWrap.prepend(markButton);
        markButton.on('click', function() {
            addMarkedDiscussion(discussionId,$outerWrap);
            markButton.remove();
            addUnmarkButton($buttonsWrap, $outerWrap, discussionId);
        });
    }
    function addUnmarkButton($buttonsWrap, $outerWrap, discussionId) {
        var unmarkButton = $('<button class="bsg-action-btn m-active" title="unmark = remove highlight of this post"><i class="fa fa-paint-brush"></i></button>');
        $buttonsWrap.prepend(unmarkButton);
        unmarkButton.on('click', function() {
            addMarkedDiscussion(discussionId,$outerWrap);
            unmarkButton.remove();
            addMarkButton($buttonsWrap, $outerWrap, discussionId);
        });
    }

    function markPostOfStalkedUser($outerWrap) {
        $outerWrap.css('border', '2px solid red');
    }
    function unmarkPostOfStalkedUser($outerWrap) {
        $outerWrap.css('border', '');
    }

    function markDiscussion($outerWrap) {
        $outerWrap.css('border', '2px dashed green');
    }
    function unmarkDiscussion($outerWrap) {
        $outerWrap.css('border', '');
    }

    function getStylesForNewComments(commentsCount) {
        var styles = {number: '', section: ''};
        if (commentsCount >= 100) {
            styles.section = 'color: #fd00ff; margin-left: 5px;';
            styles.number = 'font-size: 25px; font-weight: 900;';
        } else if (commentsCount >= 50) {
            styles.section = 'color: red; margin-left: 5px;';
            styles.number = 'font-size: 20px; font-weight: 600;';
        } else if (commentsCount >= 10) {
            styles.section = 'color: blue; margin-left: 5px;';
            styles.number = 'font-size: 13px;';
        }
        return styles;
    }

    function addReadDiscussion(id, discussion) {
        var readDiscussions = getReadDiscussions() || {};
        readDiscussions[id] = discussion;
        localStorage.setItem(storageName, JSON.stringify(readDiscussions));
    }

    function getReadDiscussions() {
        var readDiscussions = localStorage.getItem(storageName);
        if (readDiscussions) {
            return JSON.parse(readDiscussions);
        }
    }

    function getStalkedUsers() {
        return JSON.parse(localStorage.getItem(stalkedStorageName)) || [];
    }

    function getMarkedDiscussions() {
        return JSON.parse(localStorage.getItem(markedDiscussionsStorageName)) || [];
    }

    function addOrRemoveStalkedUser(userName,$outerWrap) {
        var users = getStalkedUsers(),
            index = users.indexOf(userName);
        if (index < 0) {
            users.push(userName);
            localStorage.setItem(stalkedStorageName, JSON.stringify(users));
            markPostOfStalkedUser($outerWrap);
        } else {
            users.splice(index, 1);
            localStorage.setItem(stalkedStorageName, JSON.stringify(users));
            unmarkPostOfStalkedUser($outerWrap);
        }
    }

    function addMarkedDiscussion(discussionId,$outerWrap) {
        var markedDiscussions = getMarkedDiscussions(),
            index = markedDiscussions.indexOf(discussionId);
        if (index < 0) {
            markedDiscussions.push(discussionId);
            localStorage.setItem(markedDiscussionsStorageName, JSON.stringify(markedDiscussions));
            markDiscussion($outerWrap);
        } else {
            markedDiscussions.splice(index, 1);
            localStorage.setItem(markedDiscussionsStorageName, JSON.stringify(markedDiscussions));
            unmarkDiscussion($outerWrap);
        }
    }

    function addStyles() {
        GM_addStyle('.action-btns-wrap { display: none; position: absolute; margin-left: -115px; width: 115px; }');
        GM_addStyle('.table__row-outer-wrap:hover > .action-btns-wrap { display: block; }');
        GM_addStyle('.bsg-action-btn { ' +
                    'display: inline-block; margin: 5px; ' +
                    'border: 1px solid #d6d6d6;' +
                    'font: 700 13px/32px "Open Sans",sans-serif;' +
                    'padding: 0 15px;' +
                    'cursor: pointer;' +
                    'text-align: center;' +
                    'border-radius: 4px;' +
                    'background-color: #f3f3f3;' +
                    'background-image: none;' +
                    'color: #757575;' +
                    'width: 46px;' +
                    '}');
        GM_addStyle('.bsg-action-btn.m-active, .bsg-action-btn:hover {' +
                    'border-color: #B9D393 #96BC69 #73A442 #A0C870;' +
                    'background-image: linear-gradient(#cef2aa 0%, #b4e08a 50%, #9AC96A 100%);' +
                    'background-image: -moz-linear-gradient(#cef2aa 0%, #b4e08a 50%, #9AC96A 100%);' +
                    'background-image: -webkit-linear-gradient(#cef2aa 0%, #b4e08a 50%, #9AC96A 100%);' +
                    '}');
        GM_addStyle('.bsg-action-btn.m-active:hover {' +
                    'border-color: #edbecd #f0afc5 #de95ae #f2b1c8 !important;' +
                    'background-image: linear-gradient(#fad9e4 0%, #f1c0d2 100%);' +
                    'background-image: -moz-linear-gradient(#fad9e4 0%, #f1c0d2 100%);' +
                    'background-image: -webkit-linear-gradient(#fad9e4 0%, #f1c0d2 100%);' +
                    '}');
    }

})(jQuery);
