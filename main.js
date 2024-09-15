// ==UserScript==
// @name           繁簡轉換
// @name:zh-TW     繁簡轉換
// @name:zh-hant   繁簡轉換
// @name:en        Chinese Characters Conversion
// @name:en-US     Chinese Characters Conversion
// @name:en-UK     Chinese Characters Conversion
// @name:es        Conversión de caracteres chinos
// @name:fr        Conversion des caractères chinois
// @name:ru        Конвертация китайских иероглифов
// @name:af        Chinese karakters omskakeling
// @name:tibt      རྒྱ་ཡིག་གི་ཡི་གེ་བསྒྱུར།
// @icon           https://lh3.googleusercontent.com/fife/ALs6j_EdYy6J-9PySp5oODgrGoJIntC9RD9whzX6OdB7Si7VAxpn8uOhSmSv8J9T6nVZj__hdlxRO--SVxdhPDUdlnAT7wWf3-XGbBvjy2ikqG6jCQ-2913KYl9FMHm4cR9TeD0OvDe-1Wd1xBfKu14xLqGflsAGMmBlJG3Pq579t4msCGPTvQDvQsPF-q_3bmQ581lpvdv-EA0f_xFMl12HeCPxDxyXUrkqwWcavaHbMvlGOB-JQxD5YwQ-D0Ib0kKjN1PlAKUjVO5I71A-hyrPWnSAmiNDd2Ta4YJL-TFY7Wy6Cqv-XmTEys_9xHMY04YcL60mJBhd7sqCLb3D2hD1maZgAk5em1HdjJwEC2CziExPEWMlmoGosoeu6eWi91a0mXr65k3gH7Hv9lQ0OYurZ_vjk4be_n1RlTgZQ_Kdrzozute6czHeT_XvnfUmR2W6mG8zOuAnT_4K4cYXgn0MpxvY6W7mpygXboZV3KvFUza36cuELJxLVOo_o8oVC63SQQchvnS0o1bpwY6SdwE7B1eVdi64-CQyCnZCri3s67i-zKXlt5V3_r81eYvNdCfPaMeFH4lXQzhDrqTKRrCbI79kWDg5EfxFA0d4PVdUmXp3JWgTQ3ZiqPdUKLfP4zk7RrDJUUdrzUbprF3AHKSpr1MaAiipYWZAe-slqv6tHwVwams-rL4tkcFaruetYhI987kdnfCe-f9xeHYd8mZZEOs6KFcoenNlReU_1BpEwsqbvbPWIYXDzc6eePwalLzkIGPfEnrz1zhfSmADxKrizdCz9qR0ZFupVrp9RljoJ6OHUG-ff2PqPYK111-pQf5ty4vol_CfBm3L4gaaSwJS9fE5NZm6yIishDJo66FSq5OQbxlNAcDOLYv6t6LWbx7cP2EXPk2NtOgC6W1gQRF3IOK9y1iDhTFjfFJ0GGuOGSBOOmxflrX2M756OTNrTGOHxB-yiSMZ54IkmjOIJtbT7syNAbcBUn9YrlPmqkPkxT0wB41RrgBxwnxOMGxPt4inz_0w6ihTzEbjkSTLjLAQTNByj63NZNiUhbgi3rcg4lGIRqPiTwXy9T-TphFzT-nbJ2xHwmIr2ceewsjzKws8I6_AoqAMFac7z2YZs1TrA2kE_6wz9ei8p7vuLVD-MzGgZSf57nMVkjRNs7tW3VAF8ucOO7028mQMYSlRigM2leH69xmHesVeoeQnQJnj-9qH4vTxonOfJq6PpDSXH13CbO7QeHeBksJbIsAxPpYh3_Fg8LF-vqhzdorccUEzeXQRt-IAnyaNWX10TK20aT6qyrZasn0JOqskDn0vqB5NWPMjkDTd-FUB4sOIViJ2jmMhXQtUisdfivh9JSKfYv64R-eSHQz0ZqIciOD0rZlU-8E4SeRVrrBW3JZCyr-kGk1cN73kG6JMiuDAiTpgLE_7vPn07UALSzIcaWm6g8ss-sD9Wd4ru8AqQnyOtgCAKIHAXYnuTbsk1R2sESSGnl-hOol2wgmINBEOxF_FaBPvwYlJi78Zbu9U3-4vCVDTw44fY5jo4ZkdvjQfiSlwBcW-v-t9ajq2KazwLjw3batnIqDeA_niRDdTLXeuSX9rgM8xAJsMhdyfMW0GvycZG32pJA=w2186-h1445
// @namespace      https://tampermonkey.net/
// @version        0.28
// @description    汉 -> 漢
// @description:en Convert Simplified Chinese characters to Traditional Chinese characters
// @author         lilauid
// @match          *://*.google.com/search*
// @match          *://*.bbc.com/*
// @match          *://*.wiktionary.org/*
// @grant          none
// @license        GNU 3.0
// ==/UserScript==

(function() {
    'use strict';

    let SChineseCharactersN = 2879; // 可轉換的字
    let SChineseWordsN = 470; // 可轉換的詞
    let StVersion = 0.28; // 版本

    let isInputFocused = false; // 用來標記是否在輸入狀態
    let replaceRules = { titleRules: {}, textRules: {} }; // 預設空白規則
    const cacheKey = 'replace_rules_cache'; // 本地快取鍵
    let timeoutId = null;

    // 從 GitHub API 加載替換規則，並檢查快取
    function loadReplaceRules() {
        let cachedRules = localStorage.getItem(cacheKey);
        if (cachedRules) {
            replaceRules = JSON.parse(cachedRules);
            console.log('使用本地快取的替換規則\n成功加載並快取替換規則:', replaceRules);
            applyReplacements();
        } else {
            fetch('https://api.github.com/repos/lauidli/Simplified-Traditional/contents/replace_rules.json')
                .then(response => response.json())
                .then(data => {
                    const base64Content = data.content;
                    const binaryContent = atob(base64Content);
                    const decoder = new TextDecoder('utf-8');
                    const uint8Array = new Uint8Array(binaryContent.length);

                    for (let i = 0; i < binaryContent.length; i++) {
                        uint8Array[i] = binaryContent.charCodeAt(i);
                    }

                    console.log(`\n                                              .@@@\n                                                @@@@@@\n                              .@@@@@@          .@@@@@@\n          @@@@@                  @@@@@          @@@@@    ,,,\n          .@@@@@@@@@              @@@@*      .*@@@@@@@@@@@@@@@@/\n              @@@@@@@(        ./&@@@@@@@@@@@@@@@@@@@,\n                @@@@@@  .@@@@@@@@@@@@@@        @@@@\n                                  .@@@@        @@@@\n                                    @@@    .@@@@@@@@\n                                    @@@@@@@@@@@@#,\n  .@@@@@,                            @&@@@@@@@,        .,\n    @@@@@@@@@                            @@@@@@.@@@@@@@@@@@@@@\n      (@@@@@@@#          @@@(     . /@@@@@@@@@@@@      .@@@@@@@@\n        .@@@@@&          .@@@@@@@@@@    .(@@@@          @@@@@@\n                          .@@@@/        .*@@@@        .@@@@@\n                            @@@@        . @@@@  .@@@@@@@@@@@@\n                            .@@@*  *@@@@@@@@@@@@@@@@#\n                @@            @@@@@@*    /@@@@\n              .@@              ./        &@@@(.*@@@@@@@@\n            .@@@@                    @@@@@@@@@@@@@@@@@@@\n            @@@@              @@@@@@@@@@@@@@@\n          &@@@@                          @@@@          .,@@@@@@@@@@#\n        .@@@@@                          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n        @@@@@@          .#@@@@@@@@@@@@@@@@@@@@@%\n      @@@@@@@      .@@@@@@@@@@@      .@@@@@  *@@@@\n    @@@@@@@@                        @@@@@@    .,@@@@@#\n    /@@@@@@%                    .&@@@@@@          @@@@@@@@\n      @@@@@                  .@@@@@@@              .@@@@@@@@@@@@\n      .@@@@              @@@@@@@@                    .@@@@@@@@@@@@@@@@@\n                  .@@@@@@@                              .@@@@@@@@@@@@@@@@@@\n\n\n目前版本 ${StVersion} 更新日期：113年9月15日\n\n歡迎首次使用！`);

                    const content = decoder.decode(uint8Array);
                    replaceRules = JSON.parse(content);

                    // 將替換規則存入本地快取
                    localStorage.setItem(cacheKey, JSON.stringify(replaceRules));
                    console.log('成功加載並快取替換規則:', replaceRules);
                    applyReplacements();
                })
                .catch(error => {
                    console.error('無法加載替換規則:', error);
                });
        }
    }

    // 應用替換規則
    function applyReplacements() {
        replaceTitle();
        replaceTextContent(document.body);
        console.log(`共${SChineseCharactersN}個可轉換漢字, 共${SChineseWordsN}個可轉換詞語`);
    }

    // 替換標題
    function replaceTitle() {
        if (document.title) {
            for (let [key, value] of Object.entries(replaceRules.titleRules)) {
                document.title = document.title.replace(new RegExp(key, 'g'), value);

                console.log('初次加載網頁\n> 標題成功替換')
            }
        }
    }

    // 遍歷所有非輸入框的節點並替換內容
    function replaceTextContent(node) {
        if (isInputFocused) return; // 若在輸入則不替換

        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue;
            // 僅在文字包含中文字符時才進行替換
            if (/[一-龥]/.test(text)) {
                for (let [key, value] of Object.entries(replaceRules.textRules)) {
                    text = text.replace(new RegExp(key, 'g'), value);
                }
                node.nodeValue = text;
            }
        } else {
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE &&
                    (child.tagName.toLowerCase() === 'input' ||
                     child.tagName.toLowerCase() === 'textarea')) {
                    return;
                }
                replaceTextContent(child);
            });
        }
    }

    // 監聽 DOM 變動
    const observer = new MutationObserver(mutations => {
        if (isInputFocused) return; // 在輸入時不替換

        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    replaceTextContent(node);
                });
            });
        }, 100); // 延遲 100ms 處理變更
    });

    // 當頁面加載完成後開始替換
    window.addEventListener('load', function() {
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        loadReplaceRules(); // 加載替換規則
        console.log('DEBUG > motion > 加載替換規則')
    });

    // 監聽輸入框的聚焦和失焦事件
    document.addEventListener('focusin', function(e) {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
            isInputFocused = true; // 聚焦到輸入框時停止替換
            console.log('DEBUG > motion > input > 停止替換')
        }
    });

    document.addEventListener('focusout', function(e) {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
            isInputFocused = false; // 離開輸入框後恢復替換
            replaceTextContent(document.body); // 離開後重新檢查頁面文字
            // replaceTitle();  離開輸入框時重新檢查網頁標題
            console.log('DEBUG > motion > noinput > 開始替換')
        }
    });

})();
