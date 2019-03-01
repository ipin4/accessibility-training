(function() {
  var keyListeners = [];
  initNotifier(keyListeners);
  initMenu(keyListeners);
  initTabs(keyListeners);

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

function initMenu(keyListeners) {
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
