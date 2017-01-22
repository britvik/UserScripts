// ==UserScript==
// @name         Steam DLC wishlister
// @description  Add all DLCs on wishlist by one click. Also you can remove game from wishlist directly from game store page.
// @author       Bladito
// @version      0.3.0
// @homepageURL  https://greasyfork.org/en/users/55159-bladito
// @match        http://store.steampowered.com/app/*
// @namespace    Bladito/steam-dlc-wishlister
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// ==/UserScript==

(function($) {
    'use strict';

    addButton_addAllDlcsToWishlist();
    if ($('#add_to_wishlist_area').length === 0) { // game is wishlisted
        addButton_removeFromWishlist();
    }
    $('#add_to_wishlist_area').click(addButton_removeFromWishlist);

    //-------------------------------------------------------------------------------------------------

    function addButton_removeFromWishlist() {
        var unwishlisterButton = $('<a class="btnv6_blue_hoverfade btn_medium queue_btn_inactive"><span>Remove from wishlist</span></a>');
        unwishlisterButton.click(removeFromWishlist);
        $('.queue_actions_ctn').prepend(unwishlisterButton);
    }

    function addButton_addAllDlcsToWishlist() {
        var wishlisterButton = $('<a class="btnv6_blue_blue_innerfade btn_medium"><span>Add all DLC to Wishlist</span></a>');
        wishlisterButton.click(addAllDlcsToWishlist);
        $('#dlc_purchase_action').prepend(wishlisterButton);
    }

    function addAllDlcsToWishlist() {
        $('.game_area_dlc_row').not('.ds_wishlist').each(function() {
            var $this = $(this);
            unsafeWindow.AddToWishlist($this.data('ds-appid'));
            $this.addClass('ds_wishlist').addClass('ds_flagged');
            $this.append('<div class="ds_flag ds_wishlist_flag">ON WISHLIST&nbsp;&nbsp;</div>');
        });
    }

    function removeFromWishlist() {
        var data = {
            sessionid: $('form input[name="sessionid"]').val(),
            action: 'remove',
            appid: window.location.href.match(/https?:\/\/store\.steampowered\.com\/app\/([^\/]+)/)[1]
        };
        $.post("http://store.steampowered.com/api/removefromwishlist", data, function() {
            window.location.reload();
        });
    }

})(jQuery);
