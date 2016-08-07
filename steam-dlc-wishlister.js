// ==UserScript==
// @name         Steam DLC wishlister
// @description  Adds all DLCs to wishlist
// @author       Bladito
// @version      0.1
// @match        http://store.steampowered.com/app/*
// @namespace    Bladito/steam-dlc-wishlister
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function($) {
    'use strict';

    var wishlisterButton = $('<a class="btnv6_blue_blue_innerfade btn_medium"><span>Wishlist all</span></a>');
    wishlisterButton.click(addAllDlcsToWishlist);
    $('.game_area_dlc_section').prepend(wishlisterButton);

    function addAllDlcsToWishlist() {
        $('.game_area_dlc_row').not('.ds_wishlist').each(function() {
            var $this = $(this);
            AddToWishlist($this.data('ds-appid'));
            $this.addClass('ds_wishlist').addClass('ds_flagged');
            $this.append('<div class="ds_flag ds_wishlist_flag">ON WISHLIST&nbsp;&nbsp;</div>');
        });
    }

})(jQuery);
