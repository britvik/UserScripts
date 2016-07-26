// ==UserScript==
// @name         Auto mp3 downloader
// @description  Automatic download of multiple mp3s from http://www.emp3z.com. Just insert list of songs (each on new line) into textarea, push the button and wait till it finishes.
// @author       Bladito
// @version      0.4
// @match        https://www.emp3z.com/*
// @namespace    Bladito/auto-mp3-downloader
// @grant        none
// ==/UserScript==

(function($) {
    'use strict';

    var storageName = 'Bladito_autoDownloader_toDL';
    var storageStateName = 'Bladito_autoDownloader_state';
    var storageNowFinding = 'Bladito_autoDownloader_nowFinding';
    var storageDebugName = 'Bladito_autoDownloader_isDebug';

    var STATE = {
        IDLE:'IDLE',
        FINDING_URLS:'FINDING_URLS',
        DOWNLOADING:'DOWNLOADING'
    };

    init();

    log('state=',getState(),window.location.pathname);

    if (getState() === STATE.IDLE || getState() === STATE.DOWNLOADING) {
        insertCustomHTMLElements();
    }
    if (getState() === STATE.IDLE) {
        printResults(true);
    }

    if (getState() === STATE.FINDING_URLS) {
        if (isResultsPage()) {
            log('song found');
            window.location.href = $('a[href^="/download"')[0].href;
        } else if (isDetailPage()) {
            log('remembering download url');
            $('#dl1').click();
            rememberUrlForSong();
        } else if (isNotFoundPage()) {
            log('song not found');
            setFoundDataForCurrentSong('N/A', undefined);
            findUrlForNextSong();
        } else if (isMainPage()) {
            addResetButton();
        }
    }

    if (getState() === STATE.DOWNLOADING) {
        downloadSongs();
        printResults();
        resetInitialState(true);
    }

    //------------------------------------------------------------------------------------------------------------------

    function init() {
        if (!getState()) {
            setState(STATE.IDLE);
        }

        if (getState() === STATE.FINDING_URLS && !getNextSongToFind()) {
            setState(STATE.DOWNLOADING);
        }
    }

    function findDownloadUrls() {
        var mp3List, textAreaVal = $('#my-dl-list').val();

        if (textAreaVal && textAreaVal.length > 0) {
            mp3List = prepareMp3List(textAreaVal);

            setMp3List(mp3List);
            setState(STATE.FINDING_URLS);

            log('to dl ', JSON.stringify(mp3List));

            findUrlForNextSong();
        } else {
            alert('No songs inserted into textarea!');
        }
    }

    function findUrlForNextSong() {
        var nextSong = getNextSongToFind();

        if (nextSong) {
            log('gonna find ', nextSong.name);

            setNowFinding(nextSong.name);
            $('input[name="search"]').val(nextSong.name);
            $('input[name="search"]').parents('form').submit();
        } else {
            location.href = 'https://www.emp3z.com/';
        }
    }

    function setFoundDataForCurrentSong(songName, songUrl) {
        var currentSong = getNowFinding(),
            list = getMp3List();

        for (var i=0; i<list.length; i+=1) {
            if (list[i].name === currentSong) {
                list[i].processed = true;
                list[i].url = songUrl;
                list[i].foundName = songName;
                log('SAVED URL ', songUrl, ' for song ', list[i].name);
                break;
            }
        }

        setMp3List(list);
    }

    function getNextSongToFind() {
        var list = getMp3List();

        for (var i=0; i<list.length; i+=1) {
            if (list[i].processed !== true) {
                return list[i];
            }
        }

        return undefined;
    }

    function prepareMp3List(mp3listString) {
        var result = [],
            list = mp3listString.split('\n');

        for (var i=0; i<list.length; i+=1) {
            result.push({
                name: list[i]
            });
        }

        return result;
    }

    function rememberUrlForSong() {
        var interval = setInterval(function() {
            log('finding link...');

            var link = $($('iframe')[0].contentWindow.document).find('#ytd')[0];
            if (link && link.href && link.href.length > 0) {
                window.clearInterval(interval);
                log('found link! ', link.href);
                setFoundDataForCurrentSong($('.song-list ul:eq(0) li:eq(0) a b').text(), link.href);
                findUrlForNextSong();
            }
        }, 1000);
    }

    function downloadSongs() {
        var list = getMp3List();

        for (var i=0; i<list.length; i+=1) {
            if (list[i].url) {
                window.open(list[i].url, '_blank');
            }
        }
    }

    function resetInitialState(keepList) {
        setState(STATE.IDLE);
        setNowFinding(null);
        if (!keepList) {
            setMp3List([]);
        }
    }

    function insertCustomHTMLElements() {
        var customElements, searchForm = $('form[action^="/search"]');

        customElements =
            '<div class="input-group col-lg-8" style="padding-top: 15px;">' +
            '<textarea id="my-dl-list" class="form-control" style="height: 120px;" placeholder="Insert one or multiple songs separated by enter."/>' +
            '<span class="input-group-btn" style="vertical-align: top;">' +
            '<button id="my-btn" class="btn btn-primary" style="height: 100%; min-height: 120px; border: none; padding: 0 14px;">Auto Download</button>' +
            '</span>' +
            '</div>'
        ;

        searchForm.append(customElements);
        $('#my-btn').click(findDownloadUrls);
    }

    function printResults(isOldResult) {
        var resultsHtml,
            resultsMessageHtml,
            list = getMp3List(),
            failedCounter = 0,
            searchForm = $('form[action^="/search"]'),
            resultColor = isOldResult ? '#008cba;' : '#71bf44;';

        resultsHtml = '<div class="input-group col-lg-12" style="padding: 15px; border: 1px solid '+resultColor+'"><table style="width: 100%;"><tbody><tr><th>Searched Song</th><th>Found Song</th><th></th><tr>';

        for (var i=0; i<list.length; i+=1) {
            resultsHtml += '<tr><td>' + list[i].name + '</td><td>' + list[i].foundName + '</td><td>';
            if (list[i].url) {
                resultsHtml += '<a href="' + list[i].url + '">Redownload</a>';
            } else {
                resultsHtml += 'Not found';
                failedCounter += 1;
            }
            resultsHtml += '</td></tr>';
        }
        setMp3List(list);

        resultsHtml += '</tbody></table></div>';
        resultsHtml = $(resultsHtml);

        if (isOldResult) {
            resultsMessageHtml = '<div class="input-group col-lg-12" style="height: 50px; line-height: 50px; margin-top: 15px; color: white; background-color: '+resultColor+'">Last time you searched for:';
        } else {
            resultsMessageHtml = '<div class="input-group col-lg-12" style="height: 50px; line-height: 50px; margin-top: 15px; color: white; background-color: '+resultColor+'">Found: ' + (list.length - failedCounter) + '/' + list.length + ' songs.';
        }

        searchForm.append(resultsHtml);
        resultsHtml.before(resultsMessageHtml);
    }

    function addResetButton() {
        var customElements, searchForm = $('form[action^="/search"]');

        customElements =
            '<div class="input-group col-lg-12" style="height: 50px; margin-top: 15px; color: white; background-color: #d9534f;">Oops, something went wrong :(.' +
            '<button id="my-reset-btn" type="button" class="btn btn-primary" style="margin-left: 15px;">Reset to initial state</button>' +
            '</div>'
        ;

        searchForm.append(customElements);
        $('#my-reset-btn').click(function() {
            resetInitialState();
            location.href = 'https://www.emp3z.com/';
        });
    }

    function isResultsPage() {
        return isSubstringInURL('/mp3/');
    }

    function isDetailPage() {
        return isSubstringInURL('/download/');
    }

    function isNotFoundPage() {
        return isSubstringInURL('/404.php');
    }

    function isMainPage() {
        return window.location.pathname === '/';
    }


    function isSubstringInURL(substring) {
        return window.location.pathname.substring(0, substring.length) === substring;
    }

    function log() {
        if (localStorage.getItem(storageDebugName) === 'true') {
            console.log.apply(console, arguments);
        }
    }

    function setState(state) {
        localStorage.setItem(storageStateName, state);
    }

    function getState() {
        return localStorage.getItem(storageStateName);
    }

    function setNowFinding(songName) {
        localStorage.setItem(storageNowFinding, songName);
    }

    function getNowFinding() {
        return localStorage.getItem(storageNowFinding);
    }

    function setMp3List(mp3list) {
        localStorage.setItem(storageName, JSON.stringify(mp3list));
    }

    function getMp3List() {
        return JSON.parse(localStorage.getItem(storageName));
    }

})(jQuery);
