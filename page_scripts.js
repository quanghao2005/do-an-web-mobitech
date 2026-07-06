

=====


        {"@context":"http://schema.org","@type":"WebSite","name":"Tra Cứu Thông Tin Sáp Nhập Tỉnh & Sáp Nhập Đơn Vị Hành Chính","alternateName":"Cập nhật đầy đủ danh sách tỉnh, thành phố, huyện, xã sau khi sáp nhập theo quy định mới nhất tại Việt Nam. Tra cứu thông tin hành chính, đối chiếu trước và sau sáp nhập, hỗ trợ doanh nghiệp và cá nhân nắm bắt thay đổi địa giới hành chính chính xác và kịp thời.","url":"https://thuvienphapluat.vn/ma-so-thue/tra-cuu-thong-tin-sap-nhap-tinh"}
    

=====



=====

window.TVPL_APP_ROOT = '/ma-so-thue';

=====



=====



=====



=====



=====



=====



=====



=====


    (function ($) {
        'use strict';

        var tvplAjaxLoginUrl = 'https://thuvienphapluat.vn/page/ajaxcontroler.aspx';
        var tvplUserLoggedIn = false;
        /** Google Ad Manager rewarded slot — cố định */
        var tvplRewardedAdUnitPath = '/23300291669/QC_Tang_thuong';
        var tvplSkipRewardedPreview = false;

        var tvplRewardedPubAdsHandlers = { ready: null, granted: null, closed: null };

        function tvplRemoveRewardedPubAdsListeners() {
            if (!window.googletag || !googletag.pubads) return;
            var p = googletag.pubads();
            if (tvplRewardedPubAdsHandlers.ready) {
                p.removeEventListener('rewardedSlotReady', tvplRewardedPubAdsHandlers.ready);
                tvplRewardedPubAdsHandlers.ready = null;
            }
            if (tvplRewardedPubAdsHandlers.granted) {
                p.removeEventListener('rewardedSlotGranted', tvplRewardedPubAdsHandlers.granted);
                tvplRewardedPubAdsHandlers.granted = null;
            }
            if (tvplRewardedPubAdsHandlers.closed) {
                p.removeEventListener('rewardedSlotClosed', tvplRewardedPubAdsHandlers.closed);
                tvplRewardedPubAdsHandlers.closed = null;
            }
        }

        var tvplRewardedSlot = null;
        var tvplRewardedDownloading = false;
        var tvplRewardedOfferResolve = null;
        var AD_TIMEOUT_MS = 5000;
        var tvplDownloadBtnDefaultHtml = "<i class='bi bi-download'></i> Tải về";
        var tvplDownloadBtnLoadingHtml = "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Đang tải";

        function tvplRestoreDownloadBtn($btn) {
            if (!$btn || !$btn.length) return;
            $btn.removeClass('is-loading disabled pe-none').removeAttr('aria-busy');
            $btn.html($btn.data('tvpl-dl-default-html') || tvplDownloadBtnDefaultHtml);
        }

        function tvplSetDownloadBtnLoading($btn, loading) {
            if (!$btn || !$btn.length) return;
            if (loading) {
                if (!$btn.data('tvpl-dl-default-html')) {
                    $btn.data('tvpl-dl-default-html', $btn.html());
                }
                $btn.addClass('is-loading disabled pe-none').attr('aria-busy', 'true');
                $btn.html(tvplDownloadBtnLoadingHtml);
            } else {
                tvplRestoreDownloadBtn($btn);
            }
        }

        function tvplGetRewardedConfirmModal() {
            return document.getElementById('tvplRewardedConfirmModal');
        }

        /** GPT/modal đôi khi để body overflow hidden hoặc backdrop thừa — chỉ dọn khi không còn modal Bootstrap nào đang .show (vd. đăng nhập). */
        function tvplRepairBootstrapModalScrollLock() {
            try {
                var openModals = document.querySelectorAll('.modal.show');
                if (openModals.length > 0) return;

                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('padding-right');
                document.documentElement.style.removeProperty('overflow');
                document.documentElement.style.removeProperty('padding-right');

                document.querySelectorAll('.modal-backdrop').forEach(function (el) {
                    el.remove();
                });
            } catch (ignore) { }
        }

        function tvplHideRewardedConfirmModal() {
            var el = tvplGetRewardedConfirmModal();
            if (!el) return;
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                var inst = bootstrap.Modal.getInstance(el);
                if (inst) {
                    inst.hide();
                } else {
                    bootstrap.Modal.getOrCreateInstance(el).hide();
                }
            } else if ($.fn.modal) {
                $(el).modal('hide');
            }
        }

        function tvplOfferRewardedAdChoice(gptEvent, onDecline) {
            var evRef = gptEvent;

            tvplRewardedOfferResolve = function (watch) {
                if (watch && evRef) {
                    evRef.makeRewardedVisible();
                } else {
                    onDecline();
                }
            };

            var el = tvplGetRewardedConfirmModal();
            if (!el) {
                tvplRewardedOfferResolve = null;
                var ok = window.confirm('Bạn vui lòng xem một quảng cáo ngắn và sau đó file sẽ được tự động tải về cho bạn. Xin cảm ơn.\n\nBấm OK để xem quảng cáo.');
                if (ok && evRef) {
                    evRef.makeRewardedVisible();
                } else {
                    onDecline();
                }
                return;
            }

            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                bootstrap.Modal.getOrCreateInstance(el).show();
            } else if ($.fn.modal) {
                $(el).modal('show');
            } else {
                tvplRewardedOfferResolve = null;
                var okLegacy = window.confirm('Bạn vui lòng xem một quảng cáo ngắn và sau đó file sẽ được tự động tải về cho bạn. Xin cảm ơn.\n\nBấm OK để xem quảng cáo.');
                if (okLegacy && evRef) {
                    evRef.makeRewardedVisible();
                } else {
                    onDecline();
                }
            }
        }

        function tvplDestroyRewardedSlot() {
            if (tvplRewardedSlot && window.googletag && googletag.destroySlots) {
                try {
                    googletag.destroySlots([tvplRewardedSlot]);
                } catch (ignore) { }
                tvplRewardedSlot = null;
            }
        }

        function tvplLogRewardedDownload(reason, fileUrl) {
            if (typeof console !== 'undefined' && console.log) {
                console.log('rewarded_download', { reason: reason, fileUrl: fileUrl });
            }
            if (typeof gtag === 'function') {
                gtag('event', 'rewarded_download', { reason: reason, file_url: fileUrl });
            }
        }

        /** Tạm thời: điều hướng cùng tab — tránh popup blocker trên mobile sau rewarded. */
        function tvplNavigateDownload(fileUrl) {
            if (tvplRewardedDownloading || !fileUrl) return;
            tvplRewardedDownloading = true;
            window.location.href = fileUrl;
            window.setTimeout(function () {
                tvplRewardedDownloading = false;
            }, 2000);
        }

        function tvplStartRewardedDownload(fileUrl, $btn) {
            if (!fileUrl) return;

            if (!tvplRewardedAdUnitPath || tvplSkipRewardedPreview) {
                tvplLogRewardedDownload(tvplSkipRewardedPreview ? 'preview_skip' : 'no_ad_unit_config', fileUrl);
                tvplRestoreDownloadBtn($btn);
                tvplNavigateDownload(fileUrl);
                return;
            }

            if (!window.googletag || !googletag.cmd) {
                tvplLogRewardedDownload('googletag_unavailable', fileUrl);
                tvplRestoreDownloadBtn($btn);
                tvplNavigateDownload(fileUrl);
                return;
            }

            var adReady = false;
            var rewardGranted = false;
            var finished = false;

            function fallbackDownload(reason) {
                if (finished) return;
                finished = true;
                window.clearTimeout(fallbackTimer);
                tvplRestoreDownloadBtn($btn);
                tvplRemoveRewardedPubAdsListeners();
                tvplLogRewardedDownload(reason, fileUrl);
                tvplDestroyRewardedSlot();
                tvplNavigateDownload(fileUrl);
                window.setTimeout(tvplRepairBootstrapModalScrollLock, 0);
                window.setTimeout(tvplRepairBootstrapModalScrollLock, 350);
                window.setTimeout(tvplRepairBootstrapModalScrollLock, 750);
            }

            var fallbackTimer = window.setTimeout(function () {
                if (!adReady) {
                    fallbackDownload('ad_timeout_or_no_fill');
                }
            }, AD_TIMEOUT_MS);

            googletag.cmd.push(function () {
                try {
                    tvplRemoveRewardedPubAdsListeners();
                    tvplDestroyRewardedSlot();

                    var slot = googletag.defineOutOfPageSlot(
                        tvplRewardedAdUnitPath,
                        googletag.enums.OutOfPageFormat.REWARDED
                    );

                    if (!slot) {
                        fallbackDownload('rewarded_not_supported');
                        return;
                    }

                    tvplRewardedSlot = slot;
                    slot.addService(googletag.pubads());

                    tvplRewardedPubAdsHandlers.ready = function (event) {
                        if (event.slot !== slot || finished) return;

                        adReady = true;
                        window.clearTimeout(fallbackTimer);

                        tvplRestoreDownloadBtn($btn);
                        tvplOfferRewardedAdChoice(event, function () {
                            fallbackDownload('user_skip_ad');
                        });
                    };

                    tvplRewardedPubAdsHandlers.granted = function (event) {
                        if (event.slot !== slot || finished) return;

                        rewardGranted = true;
                        fallbackDownload('reward_granted');
                    };

                    tvplRewardedPubAdsHandlers.closed = function (event) {
                        if (event.slot !== slot || finished) return;

                        if (!rewardGranted) {
                            fallbackDownload('ad_closed_before_reward');
                        }
                        window.setTimeout(tvplRepairBootstrapModalScrollLock, 100);
                        window.setTimeout(tvplRepairBootstrapModalScrollLock, 450);
                    };

                    googletag.pubads().addEventListener('rewardedSlotReady', tvplRewardedPubAdsHandlers.ready);
                    googletag.pubads().addEventListener('rewardedSlotGranted', tvplRewardedPubAdsHandlers.granted);
                    googletag.pubads().addEventListener('rewardedSlotClosed', tvplRewardedPubAdsHandlers.closed);

                    try {
                        googletag.enableServices();
                    } catch (ignore) { }

                    googletag.display(slot);
                } catch (err) {
                    if (typeof console !== 'undefined' && console.warn) {
                        console.warn('tvpl rewarded download:', err);
                    }
                    fallbackDownload('gpt_runtime_error');
                }
            });
        }

        function tvplGetLoginModal() {
            return document.getElementById('ViewLoginAngRegiter');
        }

        function tvplShowLoginModal() {
            var el = tvplGetLoginModal();
            if (!el) return;
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                bootstrap.Modal.getOrCreateInstance(el).show();
            } else if ($.fn.modal) {
                $(el).modal('show');
            }
        }

        function tvplResetLoginModalUi() {
            var $m = $('#ViewLoginAngRegiter');
            if (!$m.length) return;
            $m.find('.lgOp').show();
            $m.find('.ipPhone').hide();
            $m.find('.trLogin').show();
            $m.find('.btnRegiter').val('Đăng ký');
            var $abcBtn = $m.find('.abcRioButton');
            if ($abcBtn.length) {
                $abcBtn.html("<img src='https://thuvienphapluat.vn/images/login-google.png' alt='' />");
            }
            $m.find('.btnLogin').show();
            $m.find('.btnRegiter').show();
            $m.find('#loaddingLogin').hide();
            $m.find('#loaddingRegiter').hide();
        }

        /** Mở popup đăng nhập/đăng ký (tương thích onclick / luồng cũ Hỏi đáp). */
        window.opLogin = function () {
            tvplResetLoginModalUi();
            tvplShowLoginModal();
        };

        $(document).on('click', '.tier1-register-btn', function (e) {
            e.preventDefault();
            if (typeof window.opLogin === 'function') window.opLogin();
        });

        $(function () {
            var $modal = $('#ViewLoginAngRegiter');
            var $rewardedOfferModal = $('#tvplRewardedConfirmModal');

            if ($rewardedOfferModal.length) {
                $rewardedOfferModal.on('hidden.bs.modal', function () {
                    if (tvplRewardedOfferResolve) {
                        var r = tvplRewardedOfferResolve;
                        tvplRewardedOfferResolve = null;
                        r(false);
                    }
                    window.setTimeout(tvplRepairBootstrapModalScrollLock, 0);
                    window.setTimeout(tvplRepairBootstrapModalScrollLock, 200);
                });

                $rewardedOfferModal.find('.tvpl-rewarded-watch').on('click', function () {
                    if (!tvplRewardedOfferResolve) return;
                    var r = tvplRewardedOfferResolve;
                    tvplRewardedOfferResolve = null;
                    r(true);
                    tvplHideRewardedConfirmModal();
                });
            }

            if ($modal.length) {
                $modal.on('shown.bs.modal', function () {
                    tvplResetLoginModalUi();
                });

                $modal.on('hidden.bs.modal', function () {
                    tvplResetLoginModalUi();
                });
            }

            var ckk = null;
            if (!tvplUserLoggedIn) {
                ckk = $('#txtCheckDl').val();
            }

            $('#news-content a').each(function () {
                var $a = $(this);
                var link = $a.attr('href');
                if (!link) return;
                if (
                    link.indexOf('.doc') === -1 &&
                    link.indexOf('.xls') === -1 &&
                    link.indexOf('.pdf') === -1 &&
                    link.indexOf('.zip') === -1 &&
                    link.indexOf('.rar') === -1
                )
                    return;

                $a.addClass('download-file');
                $a.attr('target', '_blank');
                //$a.attr('rel', 'noopener noreferrer');
                $a.html("<i class='bi bi-download'></i> Tải về");

                if (tvplUserLoggedIn) return;

                if (ckk !== 'True') {
                    $a.attr('href', '#');
                    $a.on('click', function () {
                        window.opLogin();
                        return false;
                    });
                } else if (tvplRewardedAdUnitPath && !tvplSkipRewardedPreview) {
                    var dlUrl = link;
                    $a.on('click.tvplRewardedDl', function (e) {
                        if (e.which !== 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        var $dlBtn = $(this);
                        if ($dlBtn.hasClass('is-loading')) return false;
                        tvplSetDownloadBtnLoading($dlBtn, true);
                        tvplStartRewardedDownload(dlUrl, $dlBtn);
                        return false;
                    });
                }
            });

            $('.showlg').show();

            if (!$modal.length) return;

            var currUrlReg = window.location.href;

            $modal.find('.btnRegiter').off('click.tvplReg').on('click.tvplReg', function () {
                var $btn = $(this);
                $btn.hide();
                $modal.find('#loaddingRegiter').show();

                var params =
                    'r_txtMBV=0&r_Add=' +
                    encodeURIComponent($modal.find('.r_Add').val() || '') +
                    '&r_txtNameUser=' +
                    encodeURIComponent($modal.find('.r_txtNameUser').val() || '') +
                    '&r_txtUser=' +
                    encodeURIComponent($modal.find('.r_txtUser').val() || '') +
                    '&r_txtPass=' +
                    encodeURIComponent($modal.find('.r_txtPass').val() || '') +
                    '&r_txtEmail=' +
                    encodeURIComponent($modal.find('.r_txtEmail').val() || '') +
                    '&r_txtPhone=' +
                    encodeURIComponent($modal.find('.r_txtPhone').val() || '') +
                    '&rt_chkAgree=' +
                    encodeURIComponent($modal.find('.rt_chkAgree').val() || '') +
                    '&r_AppType=' +
                    encodeURIComponent($modal.find('.r_AppType').val() || '') +
                    '&rt_action=' +
                    encodeURIComponent(currUrlReg);

                $.ajax({
                    url: tvplAjaxLoginUrl,
                    data: params + '&action=Regiter',
                    type: 'POST',
                    success: function (response) {
                        $modal.find('#loaddingRegiter').hide();
                        $btn.show();
                        if (response !== '<ok>' && response !== '') {
                            alert(String(response).replace(/<br\s*\/?>/gi, '\n'));
                        } else {
                            location.reload();
                        }
                    },
                    error: function () {
                        $modal.find('#loaddingRegiter').hide();
                        $btn.show();
                    },
                });
            });

            $modal.find('.btnLogin').off('click.tvplLogin').on('click.tvplLogin', function () {
                var $btn = $(this);
                $btn.hide();
                $modal.find('#loaddingLogin').show();

                var params =
                    '&l_txtUser=' +
                    encodeURIComponent($modal.find('#l_txtUser').val() || '') +
                    '&l_txtPass=' +
                    encodeURIComponent($modal.find('#l_txtPass').val() || '');

                var action = $modal.find('#chkLawwNet').is(':checked') ? 'LoginLN' : 'Login';

                $.ajax({
                    url: tvplAjaxLoginUrl,
                    data: params + '&action=' + action,
                    type: 'POST',
                    success: function (response) {
                        $btn.show();
                        $modal.find('#loaddingLogin').hide();
                        if (response !== '<ok>' && response !== '') {
                            alert(String(response).replace(/<br\s*\/?>/gi, '\n'));
                        } else {
                            location.reload();
                        }
                    },
                    error: function () {
                        $btn.show();
                        $modal.find('#loaddingLogin').hide();
                    },
                });
            });
        });

        window.parseQuery = window.parseQuery || function (query) {
            var Params = {};
            if (!query) return Params;
            var Pairs = query.split(/[;&]/);
            for (var i = 0; i < Pairs.length; i++) {
                var KeyVal = Pairs[i].split('=');
                if (!KeyVal || KeyVal.length !== 2) continue;
                var key = decodeURIComponent(KeyVal[0].replace(/\+/g, ' '));
                var val = decodeURIComponent(KeyVal[1].replace(/\+/g, ' '));
                Params[key] = val;
            }
            return Params;
        };
    })(jQuery);


=====



=====


    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-PGVTRDMJGD');


=====



=====


    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-4ZLYHTEYW3');


=====


var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/66665d19981b6c56477b6724/1hvvtnb44';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();


=====


    (function () {
        var script = document.createElement("script");
        script.src = "https://cdn.thuviennhadat.vn/upload/static/bandoVN_SapNhap.js";
        script.onload = function () {
            console.log("Map script loaded");
        };
        document.head.appendChild(script);
    })();

    function removeDiacritics(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    function accentInsensitiveMatcher(params, data) {
        if ($.trim(params.term) === '') return data;

        const term = removeDiacritics(params.term);
        const text = removeDiacritics(data.text);
        return text.indexOf(term) > -1 ? data : null;
    }

    $(function () {
        const baseUrl = 'https://thuvienphapluat.vn/ma-so-thue/tra-cuu-thong-tin-sap-nhap-tinh';
        const select2Opts = {
            width: '100%',
            matcher: accentInsensitiveMatcher,
            dropdownCssClass: 'tvpl-sapnhap-select2-dropdown'
        };

        if ($('#tinh-cu').length) {
            $('#tinh-cu')
                .select2($.extend({}, select2Opts, { placeholder: '-- Chọn tỉnh / TP --' }))
                .on('change', function () {
                    const val = $(this).val();
                    if (val) {
                        window.location.href = `${baseUrl}?MaTinh=${val}`;
                    }
                });
        }

        if ($('#xa-cu').length) {
            $('#xa-cu')
                .select2($.extend({}, select2Opts, { placeholder: '-- Chọn phường / xã --' }))
                .on('change', function () {
                    const xaVal = $(this).val();
                    const maTinh = $('#tinh-cu').val();
                    if (xaVal && maTinh) {
                        window.location.href = `${baseUrl}?MaTinh=${maTinh}&MaXa=${xaVal}`;
                    }
                });
        }

        if ($('#tinh-moi').length) {
            $('#tinh-moi')
                .select2($.extend({}, select2Opts, { placeholder: '-- Chọn tỉnh / TP --' }))
                .on('change', function () {
                    const val = $(this).val();
                    if (val) {
                        window.location.href = `${baseUrl}?Loai=sau-sap-nhap&MaTinh=${val}`;
                    }
                });
        }

        if ($('#xa-moi').length) {
            $('#xa-moi')
                .select2($.extend({}, select2Opts, { placeholder: '-- Chọn phường / xã --' }))
                .on('change', function () {
                    const xaVal = $(this).val();
                    const maTinh = $('#tinh-moi').val();
                    if (xaVal && maTinh) {
                        window.location.href = `${baseUrl}?Loai=sau-sap-nhap&MaTinh=${maTinh}&MaXa=${xaVal}`;
                    }
                });
        }
    });


=====

(function () {
            var mq = window.matchMedia("(max-width: 767.98px)");
            var header = document.querySelector(".site-header");
            var mobileSearchToggle = document.getElementById("tier1-mobile-search-toggle");
            var mobileSearchPanel = document.getElementById("tier1-mobile-search");
            var mobileSearchInput = document.getElementById("tier1-mobile-search-input");
            var menuInner = document.querySelector(".tier2-inner-menu");
            var megaMenus = document.querySelectorAll(".tier2-mega");
            var megaParents = new Map();
            megaMenus.forEach(function (m) { megaParents.set(m, m.parentElement); });

            var lastScrollTop = 0;
            var threshold = 500; // NgÆ°á»¡ng cuá»™n 500px theo yÃªu cáº§u

            function closeMobileTier1Search() {
                if (!mobileSearchPanel || !mobileSearchToggle) return;
                mobileSearchPanel.hidden = true;
                mobileSearchToggle.setAttribute("aria-expanded", "false");
                if (mq.matches) setMegaTop();
            }

            function toggleMobileTier1Search() {
                if (!mobileSearchPanel || !mobileSearchToggle || !mq.matches) return;
                var open = mobileSearchPanel.hidden;
                mobileSearchPanel.hidden = !open;
                mobileSearchToggle.setAttribute("aria-expanded", open ? "true" : "false");
                if (open) {
                    closeAllMega();
                    setMegaTop();
                    if (mobileSearchInput) {
                        requestAnimationFrame(function () {
                            mobileSearchInput.focus();
                        });
                    }
                }
            }

            function setMegaTop() {
                if (header && mq.matches)
                    document.documentElement.style.setProperty("--tier2-mega-top", Math.round(header.getBoundingClientRect().bottom) + "px");
            }

            function closeAllMega() {
                document.querySelectorAll(".tier2-has-mega").forEach(function (li) {
                    li.classList.remove("tier2-mega-open");
                    var b = li.querySelector(".tier2-mega-trigger");
                    if (b) b.setAttribute("aria-expanded", "false");
                });
                document.querySelectorAll(".tier2-mega").forEach(function (m) {
                    m.classList.remove("is-mobile-open");
                    // Move back to original parent when closing
                    var p = megaParents.get(m);
                    if (p && m.parentElement !== p) p.appendChild(m);
                });
            }

            if (mobileSearchToggle && mobileSearchPanel) {
                mobileSearchToggle.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!mq.matches) return;
                    toggleMobileTier1Search();
                });
            }

            document.querySelectorAll(".tier2-mega-trigger").forEach(function (btn) {
                btn.addEventListener("click", function (e) {
                    if (!mq.matches) return;
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileTier1Search();
                    var li = btn.closest(".tier2-has-mega");
                    var megaId = btn.getAttribute("aria-controls");
                    var megaMenu = document.getElementById(megaId);
                    if (!li || !megaMenu) return;

                    var wasOpen = li.classList.contains("tier2-mega-open");
                    closeAllMega();
                    if (!wasOpen) {
                        setMegaTop();
                        li.classList.add("tier2-mega-open");
                        btn.setAttribute("aria-expanded", "true");

                        // Teleport mega menu to header on mobile to avoid clipping and layout overflow
                        if (megaMenu.parentElement !== header) {
                            header.appendChild(megaMenu);
                        }
                        megaMenu.classList.add("is-mobile-open");
                    }
                });
            });

            document.addEventListener("click", function (e) {
                if (!mq.matches) return;
                if (e.target.closest("#tier1-mobile-search") || e.target.closest("#tier1-mobile-search-toggle"))
                    return;
                closeMobileTier1Search();
                if (!e.target.closest(".tier2-has-mega")) closeAllMega();
            });

            document.addEventListener("keydown", function (e) {
                if (!mq.matches || e.key !== "Escape") return;
                closeMobileTier1Search();
                closeAllMega();
            });

            window.addEventListener("resize", function () {
                if (!mq.matches) {
                    closeMobileTier1Search();
                    closeAllMega();
                    // Move mega menus back to original parents for desktop hover
                    megaMenus.forEach(function (m) {
                        var p = megaParents.get(m);
                        if (p && m.parentElement !== p) p.appendChild(m);
                    });
                }
                setMegaTop();
            });

            window.addEventListener(
                "scroll",
                function () {
                    var st = window.pageYOffset || document.documentElement.scrollTop;

                    if (mq.matches && header) {
                        if (st > threshold) {
                            if (st > lastScrollTop) {
                                // Cuá»™n xuá»‘ng: áº©n header náº¿u Ä‘ang hiá»‡n fixed
                                if (header.classList.contains("header-pinned")) {
                                    header.classList.remove("header-pinned");
                                    header.classList.add("header-unpinned");
                                }
                            } else {
                                // Cuá»™n lÃªn: hiá»‡n header fixed
                                header.classList.remove("header-unpinned");
                                header.classList.add("header-pinned");
                            }
                        } else {
                            // ChÆ°a tá»›i ngÆ°á»¡ng hoáº·c quay vá» Ä‘áº§u trang: reset
                            header.classList.remove("header-pinned", "header-unpinned");
                        }
                    }

                    lastScrollTop = st <= 0 ? 0 : st;

                    if (mq.matches && document.querySelector(".tier2-has-mega.tier2-mega-open"))
                        setMegaTop();
                },
                { passive: true }
            );
        })();

=====



=====



=====



=====



=====

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'a155d086fb95e590',t:'MTc4MzA4MDkxNQ=='};var a=document.createElement('script');a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();

=====

