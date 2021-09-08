document.addEventListener("DOMContentLoaded", function(){
    // Handler when the DOM is fully loaded

function getKeyboardFocusableElements(element = document) {
    return [
      ...element.querySelectorAll(
        'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
      )
    ].filter((el) => !el.hasAttribute("disabled"));
  }
  
  // https://uxdesign.cc/how-to-trap-focus-inside-modal-to-make-it-ada-compliant-6a50f9a70700
  function moveFocusWithin(event, firstElement, lastElement) {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }
  function isTabEvent(event) {
    return event.key === "Tab" || event.keyCode === 9;
  }
  function isEscapeEvent(event) {
    return event.key === "Escape" || event.keyCode == 27;
  }
  
  const htmlElement = document.documentElement;
  const fontSizeRadioInputs = Array.from(
    document.querySelectorAll('[name="font-size"]')
  );
  const colorSchemeRadioInputs = Array.from(
    document.querySelectorAll('[name="color-scheme"]')
  );
  
  var currentFontSize = window.localStorage.getItem("fontSize");
  var currentColorScheme = window.localStorage.getItem("colorScheme");
  
  fontSizeRadioInputs.map((input) => {
    if(currentFontSize && currentFontSize === input.value) {
      setFontSizeTo(currentFontSize);
      input.checked = true;
    }
    input.addEventListener("click", (e) => {
      setFontSizeTo(e.target.value);
    });
  });
  
  colorSchemeRadioInputs.map((input) => {
    if(currentColorScheme && currentColorScheme === input.value) {
      setColorSchemeTo(currentColorScheme);
      input.checked = true;
    }
    input.addEventListener("click", (e) => {
      setColorSchemeTo(e.target.value);
    });
  });
  
  function setFontSizeTo(size) {
    htmlElement.setAttribute("data-font-size", size);
    window.localStorage.setItem("fontSize", size);
  }
  
  function setColorSchemeTo(colorScheme) {
    htmlElement.setAttribute("data-color-scheme", colorScheme);
    window.localStorage.setItem("colorScheme", colorScheme);
  }
  
  const allOverlays = [];
  class Overlay {
    constructor(id) {
      this.id = id;
      this.isOpen = false;
      const panel = document.querySelector(`[data-overlay-panel="${id}"]`);
      const focusableElements = getKeyboardFocusableElements(panel);
      this.elements = {
        button: document.querySelector(`[data-overlay-button="${id}"]`),
        closeButton: document.querySelector(
          `[data-overlay-close-button="${id}"]`
        ),
        panel: panel,
        firstElement: focusableElements[0],
        lastElement: focusableElements[focusableElements.length - 1],
        dimmer: document.querySelector(`[data-overlay-dimmer="${id}"]`)
      };
  
      this.elements.panel.classList.add("invisible");
      this.elements.panel.addEventListener(
        "transitionend",
        this.toggleInvisibleClass
      );
  
      this.elements.button.addEventListener("click", () => {
        this.isOpen === true ? this.handelClose() : this.handelOpen();
      });
      this.elements.dimmer.addEventListener("click", () => this.handelClose());
      this.elements.closeButton &&
        this.elements.closeButton.addEventListener("click", () =>
          this.handelClose()
        );
  
      allOverlays.push(this);
    }
  
    open() {
      this.elements.button.setAttribute("data-active", true);
      this.elements.panel.setAttribute("aria-hidden", false);
      this.elements.dimmer.setAttribute("aria-hidden", false);
      this.isOpen = true;
    }
  
    close() {
      this.elements.button.setAttribute("data-active", false);
      this.elements.panel.setAttribute("aria-hidden", true);
      this.elements.dimmer.setAttribute("aria-hidden", true);
      this.isOpen = false;
    }
  
    handelClose() {
      this.close();
      this.elements.button.focus();
    }
  
    handelOpen() {
      allOverlays.map((overlay) => {
        overlay.id === this.id ? overlay.open() : overlay.close();
      });
    }
  
    trapFocus() {
      this.elements.firstElement.focus();
      document.addEventListener("keydown", this.handelKeydown);
    }
  
    releaseFocus() {
      document.removeEventListener("keydown", this.handelKeydown);
    }
  
    handelKeydown = (event) => {
      isTabEvent(event) &&
        moveFocusWithin(
          event,
          this.elements.firstElement,
          this.elements.lastElement
        );
      isEscapeEvent(event) && this.handelClose();
    };
  
    toggleInvisibleClass = (event) => {
      if (event.propertyName === "opacity") return;
  
      let el = event.target;
      switch (el.getAttribute("aria-hidden")) {
        case "true":
          el.classList.add("invisible");
          this.releaseFocus();
          break;
        case "false":
          el.classList.remove("invisible");
          this.trapFocus();
          break;
      }
    }
  }
  
  const overlayButtons = Array.from(
    document.querySelectorAll("[data-overlay-button]")
  );
  
  overlayButtons.map((button) => {
    new Overlay(button.dataset.overlayButton);
  });
  
  document.addEventListener("keydown", (event) => {
    (isTabEvent(event) || isEscapeEvent(event)) && setKeyboardModeOn();
  });
  document.addEventListener(
    "click",
    (event) => {
      event.detail !== 0 && setKeyboardModeOff();
    },
    true
  );
  
  function setKeyboardModeOn() {
    document.body.setAttribute("data-keyboard-mode", true);
  }
  function setKeyboardModeOff() {
    document.body.setAttribute("data-keyboard-mode", false);
  }
  setKeyboardModeOff();
});
