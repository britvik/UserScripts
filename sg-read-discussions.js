// ==UserScript==
// @name         SG read discussions
// @description  Automatically mark read discussions
// @author       Bladito
// @version      0.2
// @match        https://www.steamgifts.com/discussion*
// @namespace    https://github.com/britvik/WebScripts/sg-read-discussions
// @downloadURL  https://github.com/britvik/WebScripts/sg-read-discussions
// @updateURL    https://github.com/britvik/WebScripts/sg-read-discussions
// ==/UserScript==

var storageName = 'Bladito_sg_read-discussions';

(function() {
    'use strict';

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
    var linkDiscussionMatch, $this, $outerWrap, $commentsCountElement, commentsCount, newCommentsCount, newCommentsStyles,
        readDiscussion, readDiscussions = getReadDiscussions();

    if (readDiscussions) {
        $('a.table__column__heading').each(function() {
            $this = $(this);
            linkDiscussionMatch = matchDiscussion(this.href);
            readDiscussion = readDiscussions[linkDiscussionMatch[1]];
            if (readDiscussion) { //we have read this discussion already
                $outerWrap = $this.closest('.table__row-outer-wrap');
                $outerWrap.css({
                    opacity: 0.3,
                    margin: '0 -20px 0 20px'
                });
                if (readDiscussion.name !== linkDiscussionMatch[2]) { //OP changed discussion name
                    $this.css('color', '#fd00ff');
                }
                $commentsCountElement = $outerWrap.find('.table__column--width-small .table__column__secondary-link');
                commentsCount = parseNumberFromElement($commentsCountElement);
                if (readDiscussion.comments !== commentsCount) {
                    newCommentsCount = commentsCount - readDiscussion.comments;
                    newCommentsStyles = getStylesForNewComments(newCommentsCount);
                    $commentsCountElement.after('<span style="'+newCommentsStyles.section+'"><span style="'+newCommentsStyles.number+'">+'+newCommentsCount+'</span> new comments</span>');
                }
            }
        });
    }
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
