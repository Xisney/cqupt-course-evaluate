// ==UserScript==
// @name         重庆邮电大学学评教
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       Roy Xie;傻妞
// @match        http://jwzx.cqupt.edu.cn/jxpj/xpjStu.php
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const notionArea = document.createElement('template');
    notionArea.innerHTML = `
    <div style="text-align: right;">
      <button id="startXpjBtn" style="background-color: #4CAF50; border: none; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 14px; margin: 4px 2px; cursor: pointer; border-radius: 5px; box-shadow: 2px 2px 2px #888888;">一键学评教</button>
      <div id="resultArea"></div>
    </div>`;

    document.querySelector('.printTable').appendChild(notionArea.content);
    document.querySelector('#startXpjBtn').addEventListener('click', start);

    async function start() {
        const searchBaseUrl = 'http://jwzx.cqupt.edu.cn/jxpj/xpjStuForm.php';
        const postBaseUrl = 'http://jwzx.cqupt.edu.cn/jxpj/post.php';
        const errorFlag = 'error flag';

        const links = Array.from(document.querySelectorAll('.xpjBtn'));
        const targets = links.map(a => a.href.split('?')[1]);
        const resolve = document.createElement('div');
        let count = 0;

        for (const s of targets) {
            try {
                const res = await fetch(`${searchBaseUrl}?${s}`).then(res => res.text());
                resolve.innerHTML = res;

                let postData = `action=jxpj_edit&${s}`;
                const inputs = resolve.querySelectorAll('.pTable tbody tr td:nth-of-type(2) > span:first-of-type input');

                inputs.forEach(input => {
                    postData += `&${input.name}=${input.value}`;
                });

                const courseName = resolve.querySelector('h3').innerText.match(/【\S+】/g)[0];
                postData += '&zbCount=10';

                const { code, info } = await fetch(postBaseUrl, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    },
                    body: encodeURI(postData),
                    method: 'post',
                }).then(res => res.json());

                if (code !== 0) {
                    alert(`脚本提示: ${info}`);
                } else {
                    const resArea = document.querySelector('#resultArea');
                    resArea.innerHTML += `<p>${courseName}评价完成</p>`;

                    if (++count === links.length) {
                        let timer = 3;
                        const timerLeft = document.createElement('p');
                        timerLeft.innerHTML = `<p id='timeLeft'>评价完成,将在${timer}秒后刷新</p>`;
                        resArea.appendChild(timerLeft);

                        const interval = setInterval(() => {
                            timerLeft.innerHTML = `<p id='timeLeft'>评价完成,将在${--timer}秒后刷新</p>`;
                            if (timer === 0) {
                                clearInterval(interval);
                                location.reload();
                            }
                        }, 1000);
                    }
                }
            } catch (e) {
                alert('脚本提示: 拉取元数据失败');
            }
        }
    }
})();
