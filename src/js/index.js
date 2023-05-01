import keys from './keys.js';

document.addEventListener('DOMContentLoaded', () => {
  const body = document.querySelector('body');
  body.innerHTML = '<div class="wrapper"></div>';
  const checkLanguage = () => {
    const currentLanguage = localStorage.getItem('currentLanguageVirtualKeyboard');
    if (!currentLanguage) {
      localStorage.setItem('currentLanguageVirtualKeyboard', 'eng');
    }
    return currentLanguage;
  };

  let currentLanguage = checkLanguage();

  body.innerHTML = `
    <header class="header">
      <div class="wrapper">
        <h1 class="title">Virtual keyboard</h1>
      </div>
    </header>

    <main class="main">
      <div class="wrapper">
        <div class="description">
          <p class="description__operating-system">developed on the windows. Press 'shift+alt' to switch language</p>
          <p class="description__lang">current language: <span>${currentLanguage}</span> </p>
        </div>
        <div class="window">
          <label for="window__input"></label>
          <textarea id="window__input" name="textarea"></textarea>
        </div>
        <div class="keyboard"></div>
      </div>
    </main>
`;

  const keyboard = document.querySelector('.keyboard');
  const textarea = document.querySelector('#window__input');

  let isCapslock = false;
  let isShift = false;

  const checkCurrentLanguage = () => {
    let prop = '';
    if (currentLanguage === 'ru') {
      prop = 'lowercaseRu';
    } else {
      prop = 'lowercaseEn';
    }
    return prop;
  };

  const initKeyboard = () => {
    currentLanguage = checkLanguage();
    const prop = checkCurrentLanguage();
    for (let i = 0; i < keys.length; i += 1) {
      const line = document.createElement('div');
      line.classList.add('line');
      line.classList.add(`line${i + 1}`);
      let outLine = '';
      let lineInner = '';
      for (let j = 0; j < keys[i].length; j += 1) {
        lineInner += `<div class="key ${keys[i][j].specialty}" data-code="${keys[i][j].keyCode}">${keys[i][j][prop]}</div>`;
      }
      outLine += lineInner;
      line.innerHTML = outLine;
      keyboard.append(line);
    }

    if (isCapslock) {
      document.querySelector('[data-code="CapsLock"]').classList.add('capsLockActive');
    }
  };
  initKeyboard();

  const virtualKey = document.querySelectorAll('.key');

  const changeLanguage = () => {
    if (checkLanguage() === 'ru') {
      currentLanguage = 'eng';
    } else {
      currentLanguage = 'ru';
    }
    localStorage.setItem('currentLanguageVirtualKeyboard', currentLanguage);
    const descriptionLang = document.querySelector('.description__lang');
    descriptionLang.innerHTML = '';
    descriptionLang.innerHTML = `current language: <span>${currentLanguage}</span>`;
  };

  const setCursorPosition = (obj, start, end) => {
    // IE >= 9 and other browsers
    if (obj.setSelectionRange) {
      obj.focus();
      obj.setSelectionRange(start, end);
    } else if (obj.createTextRange) {
      // IE < 9
      const range = obj.createTextRange();
      range.collapse(true);
      range.moveEnd('character', end);
      range.moveStart('character', start);
      range.select();
    }
  };

  const checkClass = (sel1, sel2, prop) => (document.querySelector(`[data-code=${sel1}]`).classList.contains(`${prop}`) || document.querySelector(`[data-code=${sel2}]`).classList.contains(`${prop}`));

  const changeKeyboard = () => {
    currentLanguage = checkLanguage();
    const prop = checkCurrentLanguage();
    virtualKey.forEach((element) => {
      for (let i = 0; i < keys.length; i += 1) {
        for (let j = 0; j < keys[i].length; j += 1) {
          if (element.dataset.code === keys[i][j].keyCode) {
            // eslint-disable-next-line no-param-reassign
            element.innerHTML = keys[i][j][prop];
          }
        }
      }
    });
  };

  const keyDown = (e) => {
    textarea.focus();
    // console.log(e.code);
    for (let i = 0; i < virtualKey.length; i += 1) {
      if (e.code === virtualKey[i].dataset.code) {
        virtualKey[i].classList.add('keydown');
      }
    }

    if (checkClass('ShiftRight', 'ShiftLeft', 'keydown') && document.querySelector('[data-code="AltLeft"]').classList.contains('keydown')) {
      changeLanguage();
      changeKeyboard();
      return;
    }

    if (checkClass('AltRight', 'AltLeft', 'keydown') && !checkClass('ShiftRight', 'ShiftLeft', 'keydown')) {
      e.preventDefault();
      return;
    }

    if (e.key === 'CapsLock') {
      isCapslock = !isCapslock;
      document.querySelector('[data-code="CapsLock"]').classList.toggle('capsLockActive');
      return;
    }

    if (e.code === 'ShiftLeft') {
      isShift = !isShift;
      document.querySelector('[data-code="ShiftLeft"]').classList.add('shiftActive');
      return;
    }

    if (e.code === 'ShiftRight') {
      isShift = !isShift;
      document.querySelector('[data-code="ShiftRight"]').classList.add('shiftActive');
      return;
    }

    if (e.code === 'Tab') {
      e.preventDefault();
      const curPos = textarea.selectionStart;
      textarea.value = `${textarea.value.substring(0, textarea.selectionStart)
      }   ${
        textarea.value.substring(textarea.selectionEnd, textarea.value.length)}`;
      setCursorPosition(textarea, curPos + 3, curPos + 3);
    }
  };

  const keyUp = (e) => {
    for (let i = 0; i < virtualKey.length; i += 1) {
      if (e.code === virtualKey[i].dataset.code) {
        virtualKey[i].classList.remove('keydown');
      }
    }
    if (e.code === 'ShiftLeft') {
      isShift = !isShift;
      document.querySelector('[data-code="ShiftLeft"]').classList.remove('shiftActive');
      return;
    }

    if (e.code === 'ShiftRight') {
      isShift = !isShift;
      document.querySelector('[data-code="ShiftRight"]').classList.remove('shiftActive');
    }
  };

  const mouseDown = (e) => {
    textarea.focus();
    if (e.target.classList.contains('key') && !e.target.classList.contains('specialKey')) {
      if (e.target.dataset.code === 'Space') {
        textarea.value += ' ';
      } else if (isCapslock) {
        let prop = '';
        if (checkLanguage() === 'ru') {
          prop = 'uppercaseRu';
        } else {
          prop = 'uppercaseEn';
        }
        let isFind = false;
        for (let i = 0; i < keys.length; i += 1) {
          for (let j = 0; j < keys[i].length; j += 1) {
            if (e.target.dataset.code === keys[i][j].keyCode) {
              // textarea.value += keys[i][j][prop];
              const curPos = textarea.selectionStart;
              textarea.value = `${textarea.value.substring(0, textarea.selectionStart)
              }${keys[i][j][prop]}${
                textarea.value.substring(textarea.selectionEnd, textarea.value.length)}`;
              setCursorPosition(textarea, curPos + 1, curPos + 1);

              isFind = true;
              break;
            }
          }
          if (isFind) {
            break;
          }
        }
      } else {
        // textarea.value += e.target.textContent;
        const curPos = textarea.selectionStart;
        textarea.value = `${textarea.value.substring(0, textarea.selectionStart)
        }${e.target.textContent}${
          textarea.value.substring(textarea.selectionEnd, textarea.value.length)}`;
        setCursorPosition(textarea, curPos + 1, curPos + 1);
      }
      return;
    }

    if (e.target.dataset.code === 'CapsLock') {
      isCapslock = !isCapslock;
      document.querySelector('[data-code="CapsLock"]').classList.toggle('capsLockActive');
    }
  };

  const mouseUp = () => {
    textarea.focus();
  };

  const doDelete = (position, array) => {
    if (position >= array.length) {
      return array.join('');
    }
    array.splice(position, 1);
    return array.join('');
  };

  const doBackspace = (position, array) => {
    if (position === 0 || array.length === 0) {
      return array.join('');
    }
    array.splice(position - 1, 1);
    return array.join('');
  };

  const getCaretPos = (obj) => {
    obj.focus();

    if (obj.selectionStart) {
      return obj.selectionStart; // Gecko
    }
    if (document.selection) {
      // IE
      const sel = document.selection.createRange();
      const clone = sel.duplicate();
      sel.collapse(true);
      clone.moveToElementText(obj);
      clone.setEndPoint('EndToEnd', sel);
      return clone.text.length;
    }

    return 0;
  };

  const click = (e) => {
    textarea.focus();
    if (e.target.dataset.code === 'Backspace') {
      let curPos = getCaretPos(textarea);
      textarea.value = doBackspace(curPos, [...textarea.value]);
      if (curPos <= 1) {
        curPos = 1;
      }
      setCursorPosition(textarea, curPos - 1, curPos - 1);
      return;
    }

    if (e.target.dataset.code === 'Delete') {
      const curPos = getCaretPos(textarea);
      textarea.value = doDelete(curPos, [...textarea.value]);
      setCursorPosition(textarea, curPos, curPos);
      return;
    }

    if (e.target.dataset.code === 'Enter') {
      textarea.value = `${textarea.value.substring(0, textarea.selectionStart)
      }\n${
        textarea.value.substring(textarea.selectionEnd, textarea.value.length)}`;
      textarea.focus();
      return;
    }

    if (e.target.dataset.code === 'Tab') {
      const curPos = textarea.selectionStart;
      textarea.value = `${textarea.value.substring(0, textarea.selectionStart)
      }   ${
        textarea.value.substring(textarea.selectionEnd, textarea.value.length)}`;
      setCursorPosition(textarea, curPos + 3, curPos + 3);
      return;
    }

    if (e.target.dataset.code === 'Space') {
      textarea.value += ' ';
    }
  };

  // отслеживаем события нажатия кнопки
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  keyboard.addEventListener('mousedown', mouseDown);
  keyboard.addEventListener('mouseup', mouseUp);
  keyboard.addEventListener('click', click);
});
