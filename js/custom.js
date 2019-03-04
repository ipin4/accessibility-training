function Storage() {
  this.fetchObject = function() {
    var storageData = this.storage.getItem("userStorage");
    return storageData ? JSON.parse(storageData) : {};
  };
  this.saveToStorage = function(key, value) {
    this.appData[key] = value;
    var value = JSON.stringify(this.appData)
    this.storage.setItem('userStorage', value);
  }
  this.existInBase = function(field, value) {
    var existInBase = false;
    for (key in this.appData) {
      if (this.appData[key][field] === value) {
        existInBase = true;
        break;
      }
    }
    return existInBase;
  }

  this.storage = window.localStorage;
  this.appData = this.fetchObject();
}

(function() {
  var keyListeners = [];
  var storage = new Storage();
  initNotifier(keyListeners);
  initMenu(keyListeners);
  initTabs(keyListeners);
  initForm(storage);

  var updateInfo = document.querySelector('#updateInfo');
  window.onload = function() {
    addAriaLiveUpdater(updateInfo);
  };
})();

function initNotifier(keyListeners) {
  window.addEventListener('keydown', function(e) {
    keyListeners.forEach(function(kl) {
      kl.fn(e);
    });
  });
}

function initForm(storage) {
  var userform = document.querySelector('#userform');
  var pureForm = new DOMParser().parseFromString(
    userform.innerHTML, 'text/html').body.childNodes;

  var mandatoryFields = ['name', 'surname', 'username', 'phone', 'email'];
  var otherFields = ['index', 'adress'];

  var userObject = {};

  setListeners();


  function modifyField(name) {
    var fieldNode = userform[name];
    var validateObject = isValid(fieldNode);
    var messageNode = userform.querySelector('#' + userform[name].id + 'help')

    userform[name].setAttribute('aria-invalid', !validateObject.valid)
    if (messageNode) {
      messageNode.innerHTML = validateObject.message;
    }

    if (validateObject.valid) {
      fieldNode.classList.remove('is-danger');
      fieldNode.classList.add('is-success');
      userObject[name] = fieldNode.value;
      return false;
    } else {
      fieldNode.classList.add('is-danger')
      return true;
    }
  }

  function setListeners() {
    var submit = document.querySelector('#submit');
    var cancel = document.querySelector('#cancel');

    submit.onclick = function(e) {
      e.preventDefault();
  
      var invalidFields =
        mandatoryFields.concat(otherFields).filter(modifyField);
  
      if (invalidFields.length) {
        storage.existInBase('name', userform.name.value) &&
        storage.existInBase('surname', userform.surname.value) &&
        !mandatoryFields.includes('dateofbirth') ?
          addBirthdayFIeld() :
          selectInvalid(invalidFields[0]);
      } else {
        storage.saveToStorage(userform.username.value, userObject);
        userform.reset();
        alert('Submitted succesfully!');
      }
    }
  
    cancel.onclick = function() {
      userform.innerHTML = '';
      pureForm.forEach(function(e) {
        userform.appendChild(e);
      });
      setListeners();

      userform.name.focus();
      alert('Form resetted succesfully!');
    }
  }

  function selectInvalid(invalidName) {
    userform[invalidName].focus();
  }

  function isValid(element) {
    var value = element.value;
    var field = element.id;
    var result = mandatoryFields.includes(field) ? !!value : true;
    var message = 'Field can\'t be empty';

    if (field === 'username') {
      var valueExist = storage.existInBase(field, value);
      if (valueExist) {
        message = 'Person with ' + field + 'already exist';
      }
      result = result && !valueExist;
    }

    if (field === 'phone') {
      var regex = new RegExp('^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$');
      var result = regex.test(value);
      if (!result) {
        message = 'Please fill number correctly';
      }
    }

    if (field === 'email') {
      var regex = new RegExp('^[^\s@]+@[^\s@]+\.[^\s@]+$');
      var result = regex.test(value);
      if (!result) {
        message = 'Please fill email correctly';
      }
    }

    return {
      valid: result,
      message: result ? 'Correct field' : message,
    };
  }

  function addBirthdayFIeld() {
    mandatoryFields.push('dateofbirth');

    var dateOfBirthBlock = userform.querySelector('#dateOfBirthBlock');
    dateOfBirthBlock.classList.remove('none');
    dateOfBirthBlock.focus();
  }
}

function initMenu() {
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('#' + burger.dataset.target);
  var initBurgerActions = buildInitBurgerActions(burger, menu);

  burger.addEventListener('click', function(e) {
    e.stopPropagation();
    initBurgerActions(e);
  });

  burger.addEventListener('keydown', function(e) {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.stopPropagation();
      initBurgerActions(e);
    }
  });
}

function buildInitBurgerActions(triggerIcon, content) {
  var circleFocusCallback;

  return function initBurgerActions(e) {
    if (!triggerIcon.classList.contains('is-active')) {
      circleFocusCallback = buildFocusCallback(triggerIcon, content);
      window.addEventListener('keydown', circleFocusCallback);
      content.setAttribute('aria-expanded', 'true');
    } else {
      window.removeEventListener('keydown', circleFocusCallback);
      content.setAttribute('aria-expanded', 'false');
    }

    triggerIcon.classList.toggle('is-active');
    content.classList.toggle('is-active');
  }
}

function buildFocusCallback(triggerIcon, content) {
  var contentItems = content.querySelectorAll('[role="menuitem"]');
  var keyArray = ['Tab', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
  var currentElem = 0;

  return function circleFocusCallback(e) {
    if (!keyArray.includes(e.code)) {
      return;
    }

    e.preventDefault();
    var focusedElement = triggerIcon;

    if (currentElem === 0 && (e.code === 'ArrowLeft' || e.code === 'ArrowUp' || e.code === 'Home')) {
      currentElem = contentItems.length + 1;
    }

    e.code === 'Tab' || e.code === 'ArrowRight' || e.code === 'ArrowDown' || e.code === 'End' ?
      currentElem++ : currentElem--;

    if (currentElem > 0 && currentElem <= contentItems.length) {
      var focusedElement = contentItems[currentElem - 1];
    } else {
      currentElem = 0;
    }

    focusedElement.focus();
  }
}

function addAriaLiveUpdater(elem) {
  setInterval(function() {
    var newContent = 'some new info' + Math.random();
    elem.innerHtml = newContent
  }, 1000)
}

function initTabs(keyListeners) {
  var tabs = ['tab-1', 'tab-2', 'tab-3', 'tab-4'];
  var arrowTabCallback = function(e) {
    if (['ArrowRight', 'ArrowLeft'].includes(e.code) && tabs.includes(e.target.id)) {
      var sibling = {
        ArrowRight: 'nextElementSibling',
        ArrowLeft: 'previousElementSibling',
      }
      var liNode = e.target.parentElement[sibling[e.code]];
      if (liNode) {
        liNode.firstElementChild.focus();
      }
    }
  }
  keyListeners.push({fn: arrowTabCallback});

  document.querySelectorAll('#nav li').forEach(function(navEl) {
    navEl.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTab(this.id, this.dataset.target);
    });
    navEl.addEventListener('keydown', function(e) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        toggleTab(this.id, this.dataset.target);
      }
    });
  });
  
  function toggleTab(selectedNav, targetId) {
    var navEls = document.querySelectorAll('#nav li');
  
    navEls.forEach(function(navEl) {
      if (navEl.id == selectedNav) {
        navEl.classList.add('is-active');
        navEl.setAttribute('aria-selected', 'true');
      } else {
        if (navEl.classList.contains('is-active')) {
          navEl.classList.remove('is-active');
          navEl.setAttribute('aria-selected', 'false');
        }
      }
    });
  
    var tabs = document.querySelectorAll('.tab-pane');
  
    tabs.forEach(function(tab) {
      if (tab.id == targetId) {
        tab.style.display = 'block';
        tab.setAttribute('hidden', 'false');
      } else {
        tab.style.display = 'none';
        tab.setAttribute('hidden', 'true');
      }
    });
  }
}
