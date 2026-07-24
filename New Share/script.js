(function (config) {
  var NETWORKS = {
    telegram: {
      label: "Telegram",
      icon: '<img src="https://static.tildacdn.com/tild6461-6435-4937-b262-616430313364/telegram.svg" width="20" height="20" alt="">',
      href: function (url, title) { return "https://t.me/share/url?url=" + url + "&text=" + title; }
    },
    vk: {
      label: "ВКонтакте",
      icon: '<img src="https://static.tildacdn.com/tild3162-3962-4834-a665-363964353532/vk.svg" width="20" height="20" alt="">',
      href: function (url, title) { return "https://vk.com/share.php?url=" + url; }
    },
    ok: {
      label: "Одноклассники",
      icon: '<img src="https://static.tildacdn.com/tild3838-3061-4830-b962-393531643165/odnoklassniki.svg" width="20" height="20" alt="">',
      href: function (url, title) { return "https://connect.ok.ru/offer?url=" + url + "&title=" + title; }
    },
    x: {
      label: "X (Twitter)",
      icon: '<img src="https://static.tildacdn.com/tild3632-3239-4639-a435-356631356338/x-twitter.svg" width="20" height="20" alt="">',
      href: function (url, title) { return "https://twitter.com/intent/tweet?url=" + url + "&text=" + title; }
    }
  };

  var CSS = ".sw-btn{all:unset;display:inline-flex !important;align-items:center !important;gap:6px !important;padding:8px 14px 8px 10px !important;border-radius:12px !important;font-size:14px !important;font-weight:500 !important;line-height:1 !important;cursor:pointer !important;white-space:nowrap !important;font-family:'Manrope' !important;transition:background-color .15s,border-color .15s !important;box-sizing:border-box !important;border:1px solid transparent !important;}.sw-btn img,.sw-btn svg{width:20px !important;height:20px !important;flex-shrink:0 !important;display:block !important;}.sw-btn--outline{background:#fff !important;border-color:#e5e5e5 !important;color:#000 !important;box-shadow:0 1px 2px rgba(0,0,0,.05) !important;}.sw-btn--outline:hover:not(:disabled){background:#f4f4f5 !important;}.sw-btn--secondary{background:#f4f4f5 !important;color:#000 !important;}.sw-btn--secondary:hover:not(:disabled){background:#e4e4e7 !important;}.sw-btn--square{padding:8px !important;gap:0 !important;}.sw-btn:disabled{opacity:.6 !important;cursor:not-allowed !important;}.sw-dropdown{position:relative;display:inline-block;}.sw-menu{all:initial;position:absolute;margin-top:4px;right:0;background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:4px;min-width:200px;box-shadow:0 4px 20px rgba(0,0,0,.12);display:none;z-index:9999;box-sizing:border-box;}.sw-menu--open{display:block !important;}.sw-menu-item{all:unset;display:flex !important;align-items:center !important;gap:8px !important;padding:8px 12px 8px 8px !important;border-radius:8px !important;color:#000 !important;font-size:14px !important;line-height:20px !important;font-family:'Manrope' !important;cursor:pointer !important;text-decoration:none !important;box-sizing:border-box !important;width:100% !important;min-width:fit-content !important;}.sw-menu-item:hover{background:#f4f4f5 !important;}.sw-menu-item img,.sw-menu-item svg{width:20px !important;height:20px !important;flex-shrink:0 !important;display:block !important;}";
  var SHARE_ICON = '<img src="https://static.tildacdn.com/tild3962-3237-4066-b061-383432633037/share.svg" width="20" height="20" alt="">';
  var COPY_ICON = '<img src="https://static.tildacdn.com/tild6432-3936-4037-a464-636534623735/copy.svg" width="20" height="20" alt="">';
  var CHECK_ICON = '<img src="https://static.tildacdn.com/tild3361-3361-4362-b132-613631396465/check.svg" width="20" height="20" alt="">';

  function injectCSS() {
    if (document.getElementById("sw-styles")) return;
    var el = document.createElement("style");
    el.id = "sw-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function buildMenuHTML() {
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    var html = "";
    for (var i = 0; i < config.networks.length; i++) {
      var id = config.networks[i];
      if (id === "copy") {
        html += '<button class="sw-menu-item" data-sw-copy>' + COPY_ICON + '<span>Копировать ссылку</span></button>';
      } else {
        var n = NETWORKS[id];
        if (n) {
          html += '<a class="sw-menu-item" href="' + n.href(url, title) + '" target="_blank" rel="noopener noreferrer">' + n.icon + '<span>' + n.label + '</span></a>';
        }
      }
    }
    return html;
  }

  function handleCopy(e) {
    var btn = e.currentTarget;
    var orig = btn.innerHTML;
    var url = window.location.href;

    function showCopied() {
      btn.innerHTML = CHECK_ICON + '<span>Скопировано!</span>';
      btn.disabled = true;
      setTimeout(function () { btn.innerHTML = orig; btn.disabled = false; }, 2000);
    }

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
      showCopied();
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(showCopied).catch(fallback);
    } else {
      fallback();
    }
  }

  function renderWidget(container) {
    var squareCls = config.showLabel ? "" : " sw-btn--square";
    var btnLabel = config.showLabel ? "<span>Поделиться</span>" : "";
    var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      var btn = document.createElement("button");
      btn.className = "sw-btn sw-btn--" + config.style + squareCls;
      btn.innerHTML = SHARE_ICON + btnLabel;
      btn.addEventListener("click", function () {
        navigator.share({ url: window.location.href, title: document.title }).catch(function () {});
      });
      container.appendChild(btn);
    } else {
      var wrapper = document.createElement("div");
      wrapper.className = "sw-dropdown";

      var triggerBtn = document.createElement("button");
      triggerBtn.className = "sw-btn sw-btn--" + config.style + squareCls;
      triggerBtn.innerHTML = SHARE_ICON + btnLabel;

      var menu = document.createElement("div");
      menu.className = "sw-menu";
      menu.innerHTML = buildMenuHTML();

      var copyBtns = menu.querySelectorAll("[data-sw-copy]");
      for (var j = 0; j < copyBtns.length; j++) {
        copyBtns[j].addEventListener("click", handleCopy);
      }

      triggerBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.toggle("sw-menu--open");
      });

      wrapper.appendChild(triggerBtn);
      wrapper.appendChild(menu);
      container.appendChild(wrapper);
    }
  }

  function init() {
    injectCSS();
    var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    var containers = document.querySelectorAll("." + config.className);
    for (var i = 0; i < containers.length; i++) {
      renderWidget(containers[i]);
    }
    if (!isMobile || !navigator.share) {
      document.addEventListener("click", function () {
        var menus = document.querySelectorAll(".sw-menu--open");
        for (var k = 0; k < menus.length; k++) { menus[k].classList.remove("sw-menu--open"); }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        var menus = document.querySelectorAll(".sw-menu--open");
        for (var k = 0; k < menus.length; k++) { menus[k].classList.remove("sw-menu--open"); }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})({"networks":["telegram","vk","ok","x","copy"],"style":"outline","className":"share-widget","showLabel":true,"widgetType":"dropdown"});