// ==UserScript==
// @name         Auto mp3 downloader
// @description  Automatic download of multiple mp3s from http://www.emp3z.ws/. Just insert list of songs (each on new line) into textarea, push the button and wait till it finishes.
// @author       Bladito
// @version      0.2
// @match        http://www.emp3z.ws/*
// @namespace    Bladito/auto-mp3-downloader
// @grant        none
// ==/UserScript==

var storageName = 'Bladito_autoDownloader_toDL';
var storageStateName = 'Bladito_autoDownloader_state';
var storageNowFinding = 'Bladito_autoDownloader_nowFinding';
var storageDebugName = 'Bladito_autoDownloader_isDebug';

var STATE = {
    IDLE:'IDLE',
    FINDING_URLS:'FINDING_URLS',
    DOWNLOADING:'DOWNLOADING'
};

(function() {
    'use strict';

    init();

    log('state=',getState());

    if (getState() === STATE.IDLE || getState() === STATE.DOWNLOADING) {
        insertCustomHTMLElements();
    }

    if (getState() === STATE.FINDING_URLS) {
        if (isResultsPage()) {
            log('opening download page');
            window.location.href = $('a[href^="/download"')[0].href;
        } else if (isDetailPage()) {
            $('#dl1').click();
            rememberUrlForSong();
        }
    }

    if (getState() === STATE.DOWNLOADING) {
        downloadSongs();
    }

})();

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
        location.href = 'http://www.emp3z.ws/';
    }
}

function setFoundUrlForCurrentSong(songUrl) {
    var currentSong = getNowFinding(),
        list = getMp3List();

    for (var i=0; i<list.length; i+=1) {
        if (list[i].name === currentSong) {
            list[i].url = songUrl;
            log('SAVED URL ', songUrl, ' for song ', list[i].name);
            break;
        }
    }

    setMp3List(list);
}

function getNextSongToFind() {
    var list = getMp3List();

    for (var i=0; i<list.length; i+=1) {
        if (list[i].url === undefined) {
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
            setFoundUrlForCurrentSong(link.href);
            findUrlForNextSong();
        }
    }, 1000);
}

function downloadSongs() {
    var list = getMp3List(),
        output = '\n';

    for (var i=0; i<list.length; i+=1) {
        window.open(list[i].url, '_blank');
        list[i].downloaded = true;
        output += ' - ' + list[i].name + '\n';
    }

    setMp3List(list);
    setState(STATE.IDLE);
    setNowFinding(null);
    alert('Download initiated. ' + list.length + ' songs.' + output);
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

function isResultsPage() {
    return isSubstringInURL('/mp3/');
}

function isDetailPage() {
    return isSubstringInURL('/download/');
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
