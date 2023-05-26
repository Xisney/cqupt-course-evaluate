// ==UserScript==
// @name         重庆邮电大学学评教
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       Roy Xie;AI
// @match        http://jwzx.cqupt.edu.cn/jxpj/xpjStu.php
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

 const notionArea = document.createElement('template')
    notionArea.innerHTML = `
    <div style="text-align: right;">
      <button id="startXpjBtn">一键学评教</button>
      <div id="resultArea"></div>
    </div>`

    document.querySelector('.printTable').appendChild(notionArea.content)
    document.querySelector('#startXpjBtn').addEventListener('click', start)

    async function start() {
      const searchBaseUrl = 'http://jwzx.cqupt.edu.cn/jxpj/xpjStuForm.php'
      const postBaseUrl = 'http://jwzx.cqupt.edu.cn/jxpj/post.php'
      const errorFlag = 'error flag'

      const links = Array.from(document.querySelectorAll('.xpjBtn'))
      const targets = links.map(a => a.href.split('?')[1])
      const resolve = document.createElement('div')
      let count = 0

      for (let i = 0; i < targets.length; i++) {
        const s = targets[i];
        const res = await fetch(searchBaseUrl + '?' + s)
          .then(res => res.text())
          .catch(e => errorFlag)

        if (res === errorFlag) {
          alert('脚本提示: 拉取元数据失败')
        } else {
          let postData = 'action=jxpj_edit&' + s
          resolve.innerHTML = res
          const inputs = resolve.querySelectorAll(
              '.pTable tbody tr td:nth-of-type(2) > span:first-of-type input'
            );
          for (let j = 0; j < inputs.length; j++) {
            const i = inputs[j];
            postData += `&${i.name}=${i.value}`
          }
          const courseName = resolve
            .querySelector('h3')
            .innerText.match(/【\S+】/g)[0]

          postData += '&zbCount=10'
          const { code, info } = await fetch(postBaseUrl, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: encodeURI(postData),
            method: 'post',
          }).then(res => res.json())

          if (code !== 0) {
            // 报告程序出错
            alert('脚本提示: ', info)
          } else {
            // todo 成功用户展示
            const resArea = document.querySelector('#resultArea')
            resArea.innerHTML += `<p>${courseName}评价完成</p>`

            if (++count === links.length) {
              count = 0

              let timer = 3
              const timerLeft = document.createElement('p')
              timerLeft.innerHTML = `<p id='timeLeft'>评价完成,将在${timer}秒后刷新</p>`
              resArea.appendChild(timerLeft)
              setInterval(() => {
                timerLeft.innerHTML = `<p id='timeLeft'>评价完成,将在${--timer}秒后刷新</p>`
                if (timer === 0) location.reload()
              }, 1000)
            }
          }
        }
      }
    }
  })()

