// ==UserScript==
// @name         SG read discussions
// @description  Automatically mark read discussions
// @author       Bladito
// @version      0.3
// @match        https://www.steamgifts.com/discussion*
// @namespace    Bladito/sg-discussions
// @downloadURL  https://gist.github.com/britvik/0e736360fdee3b57ea0962f7e5a71eee/raw/sg-discussions.user.js
// @grant        GM_addStyle
// ==/UserScript==

var storageName = 'Bladito_sg_read-discussions',
    stalkedStorageName = 'Bladito_sg_stalked-users';

(function() {
    'use strict';

    GM_addStyle('.stalk-btn-wrap { display: none; position: absolute; margin-left: -80px; width: 80px; }');
    GM_addStyle('.table__row-outer-wrap:hover > .stalk-btn-wrap { display: block; }');

    var discussionMatch = matchDiscussion(location.href);
    var discussionsMatch = location.href.match(/.*\/discussions\/?/);

    if (discussionMatch !== null) {
        rememberReadDiscussion(discussionMatch);
    } else if (discussionsMatch !== null) {
        markReadDiscussions();
    }

})();

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
    var linkDiscussionMatch, $this, $outerWrap, $commentsCountElement, commentsCount, newCommentsCount, newCommentsStyles, originalPoster,
        readDiscussion, readDiscussions = getReadDiscussions(), stalkedUsers = getStalkedUsers();

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
                    $commentsCountElement.after('<span style="'+newCommentsStyles.section+'"><span style="'+newCommentsStyles.number+'">+'+newCommentsCount+'</span> new comments</span>');
                }
            }
            originalPoster = $outerWrap.find('.table__column--width-fill .table__column__secondary-link:eq(1)').text();

            if (stalkedUsers.indexOf(originalPoster) > -1) {
                markPostOfStalkedUser($outerWrap);
            } else {
                addStalkButton($outerWrap, originalPoster);
            }
        });
    }
}

function addStalkButton($outerWrap, originalPoster) {
    var stalkButton = $('<div class="stalk-btn-wrap"><button class="stalk-btn sidebar__action-button">STALK</button></div>');
    $outerWrap.prepend(stalkButton);
    stalkButton.on('click', function() {addStalkedUser(originalPoster,$outerWrap);});
}

function markPostOfStalkedUser($outerWrap) {
    $outerWrap.css('border', '2px solid red');
}

function getStylesForNewComments(commentsCount) {
    var styles = {number: '', section: ''};
    if (commentsCount >= 100) {
        styles.section = 'color: #fd00ff;';
        styles.number = 'font-size: 25px; font-weight: 900;';
    } else if (commentsCount >= 50) {
        styles.section = 'color: red;';
        styles.number = 'font-size: 20px; font-weight: 600;';
    } else if (commentsCount >= 10) {
        styles.section = 'color: blue;';
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

function addStalkedUser(userName,$outerWrap) {
    var users = getStalkedUsers();
    if (users.indexOf(userName) < 0) {
        users.push(userName);
        localStorage.setItem(stalkedStorageName, JSON.stringify(users));
        markPostOfStalkedUser($outerWrap);
    }
}
