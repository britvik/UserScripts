// ==UserScript==
// @name         Steam DLC wishlister
// @description  Adds a button to put all DLCs on wishlist
// @author       Bladito
// @version      0.2.1
// @homepageURL  https://greasyfork.org/en/users/55159-bladito
// @match        http://store.steampowered.com/app/*
// @namespace    Bladito/steam-dlc-wishlister
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// ==/UserScript==

(function($) {
    'use strict';

    var wishlisterButton = $('<a class="btnv6_blue_blue_innerfade btn_medium"><span>Add all DLC to Wishlist</span></a>');
    wishlisterButton.click(addAllDlcsToWishlist);
    $('#dlc_purchase_action').prepend(wishlisterButton);

    function addAllDlcsToWishlist() {
        $('.game_area_dlc_row').not('.ds_wishlist').each(function() {
            var $this = $(this);
            unsafeWindow.AddToWishlist($this.data('ds-appid'));
            $this.addClass('ds_wishlist').addClass('ds_flagged');
            $this.append('<div class="ds_flag ds_wishlist_flag">ON WISHLIST&nbsp;&nbsp;</div>');
        });
    }

})(jQuery);
