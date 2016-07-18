// ==UserScript==
// @name         SG discussions enhanced
// @description  Automatically mark read discussions, show count of new comments since last read, show if post title changed, manually mark one post or all posts of user
// @author       Bladito
// @version      0.7
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
        var linkDiscussionMatch, $this, $outerWrap, $buttonsWrap, $commentsCountElement, commentsCount, newCommentsCount, originalPoster,
            readDiscussion, readDiscussions = getReadDiscussions(), stalkedUsers = getStalkedUsers(), markedDiscussions = getMarkedDiscussions();

        $('a.table__column__heading').each(function() {
            $this = $(this);
            $outerWrap = $this.closest('.table__row-outer-wrap');
            linkDiscussionMatch = matchDiscussion(this.href);
            readDiscussion = readDiscussions[linkDiscussionMatch[1]];

            if (readDiscussion) { //we have read this discussion already
                $outerWrap.addClass('bsg-discussion-read');
                if (readDiscussion.name !== linkDiscussionMatch[2]) { //OP changed discussion name
                    $this.addClass('bsg-discussion-title-changed');
                    $this.attr('title', 'Changed from: "' + readDiscussion.name + '"');
                }
                $commentsCountElement = $outerWrap.find('.table__column--width-small .table__column__secondary-link');
                commentsCount = parseNumberFromElement($commentsCountElement);
                if (readDiscussion.comments !== commentsCount) {
                    newCommentsCount = commentsCount - readDiscussion.comments;
                    $commentsCountElement.after('<span class="'+getClassesForNewComments(newCommentsCount)+'">(+'+newCommentsCount+')</span>');
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
        $outerWrap.addClass('bsg-stalked-discussion');
    }
    function unmarkPostOfStalkedUser($outerWrap) {
        $outerWrap.removeClass('bsg-stalked-discussion');
    }

    function markDiscussion($outerWrap) {
        $outerWrap.addClass('bsg-marked-discussion');
    }
    function unmarkDiscussion($outerWrap) {
        $outerWrap.removeClass('bsg-marked-discussion');
    }

    function getClassesForNewComments(commentsCount) {
        var classes = 'bsg-new-comments ';
        if (commentsCount >= 100) {
            classes += 'm-high';
        } else if (commentsCount >= 50) {
            classes += 'm-medium';
        } else if (commentsCount >= 10) {
            classes += 'm-low';
        }
        return classes;
    }

    function addReadDiscussion(id, discussion) {
        var readDiscussions = getReadDiscussions() || {};
        readDiscussions[id] = discussion;
        localStorage.setItem(storageName, JSON.stringify(readDiscussions));
    }

    function getReadDiscussions() {
        return JSON.parse(localStorage.getItem(storageName)) || {};
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

        GM_addStyle('.bsg-discussion-read.table__row-outer-wrap {' +
                    'opacity: 0.3;' +
                    '}');
        GM_addStyle('.bsg-stalked-discussion.table__row-outer-wrap {' +
                    'border: 2px solid red;' +
                    'opacity: 1;' +
                    '}');
        GM_addStyle('.bsg-marked-discussion.table__row-outer-wrap {' +
                    'border: 2px dashed green;' +
                    'opacity: 1;' +
                    '}');
        GM_addStyle('.bsg-discussion-title-changed {' +
                    'color: #fd00ff;' +
                    '}');

        GM_addStyle('.bsg-new-comments {' +
                    'margin-left: 5px;' +
                    '}');
        GM_addStyle('.bsg-new-comments.m-high {' +
                    'color: #fd00ff;' +
                    'font-size: 25px; font-weight: 900;' +
                    '}');
        GM_addStyle('.bsg-new-comments.m-medium {' +
                    'color: red;' +
                    'font-size: 20px; font-weight: 600;' +
                    '}');
        GM_addStyle('.bsg-new-comments.m-low {' +
                    'color: blue;' +
                    'font-size: 13px;' +
                    '}');
    }

})(jQuery);
