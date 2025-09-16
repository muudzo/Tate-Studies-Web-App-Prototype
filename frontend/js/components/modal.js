// Modal Component
class Modal {
  constructor(id, options = {}) {
    this.id = id;
    this.element = document.getElementById(id);
    this.options = {
      closable: true,
      backdrop: true,
      keyboard: true,
      focus: true,
      ...options
    };
    
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.element) {
      console.error(`Modal with id "${this.id}" not found`);
      return;
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close on backdrop click
    if (this.options.backdrop) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }

    // Close on escape key
    if (this.options.keyboard) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    // Close button
    const closeBtn = this.element.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  open() {
    if (this.isOpen) return;

    this.element.classList.add('active');
    this.isOpen = true;
    
    // Focus management
    if (this.options.focus) {
      const focusableElement = this.element.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElement) {
        focusableElement.focus();
      }
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Trigger custom event
    this.element.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: this } }));
  }

  close() {
    if (!this.isOpen) return;

    this.element.classList.remove('active');
    this.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Trigger custom event
    this.element.dispatchEvent(new CustomEvent('modal:close', { detail: { modal: this } }));
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  destroy() {
    this.close();
    this.element.removeEventListener('click', this.handleBackdropClick);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  // Static method to create modal programmatically
  static create(content, options = {}) {
    const id = `modal-${Utils.generateId()}`;
    const modalHTML = `
      <div id="${id}" class="modal">
        <div class="modal-content">
          <button class="modal-close" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new Modal(id, options);
    
    // Auto-remove after close if specified
    if (options.autoRemove !== false) {
      modal.element.addEventListener('modal:close', () => {
        setTimeout(() => modal.destroy(), 300);
      });
    }

    return modal;
  }

  // Static method to show confirmation dialog
  static confirm(message, options = {}) {
    return new Promise((resolve) => {
      const defaultOptions = {
        title: 'Confirm',
        confirmText: 'Yes',
        cancelText: 'No',
        confirmClass: 'btn-primary',
        cancelClass: 'btn-secondary'
      };
      
      const config = { ...defaultOptions, ...options };
      
      const content = `
        <div class="modal-header">
          <h3>${config.title}</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn ${config.cancelClass} modal-cancel">${config.cancelText}</button>
          <button class="btn ${config.confirmClass} modal-confirm">${config.confirmText}</button>
        </div>
      `;

      const modal = Modal.create(content, { closable: false, keyboard: false });
      modal.open();

      const confirmBtn = modal.element.querySelector('.modal-confirm');
      const cancelBtn = modal.element.querySelector('.modal-cancel');

      confirmBtn.addEventListener('click', () => {
        modal.close();
        resolve(true);
      });

      cancelBtn.addEventListener('click', () => {
        modal.close();
        resolve(false);
      });
    });
  }

  // Static method to show alert dialog
  static alert(message, options = {}) {
    return new Promise((resolve) => {
      const defaultOptions = {
        title: 'Alert',
        buttonText: 'OK',
        buttonClass: 'btn-primary'
      };
      
      const config = { ...defaultOptions, ...options };
      
      const content = `
        <div class="modal-header">
          <h3>${config.title}</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn ${config.buttonClass} modal-ok">${config.buttonText}</button>
        </div>
      `;

      const modal = Modal.create(content, { closable: false, keyboard: false });
      modal.open();

      const okBtn = modal.element.querySelector('.modal-ok');

      okBtn.addEventListener('click', () => {
        modal.close();
        resolve();
      });
    });
  }

  // Static method to show prompt dialog
  static prompt(message, defaultValue = '', options = {}) {
    return new Promise((resolve) => {
      const defaultOptions = {
        title: 'Prompt',
        confirmText: 'OK',
        cancelText: 'Cancel',
        confirmClass: 'btn-primary',
        cancelClass: 'btn-secondary',
        inputType: 'text'
      };
      
      const config = { ...defaultOptions, ...options };
      
      const content = `
        <div class="modal-header">
          <h3>${config.title}</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
          <div class="form-group">
            <input type="${config.inputType}" class="modal-input" value="${defaultValue}" placeholder="${config.placeholder || ''}">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn ${config.cancelClass} modal-cancel">${config.cancelText}</button>
          <button class="btn ${config.confirmClass} modal-confirm">${config.confirmText}</button>
        </div>
      `;

      const modal = Modal.create(content, { closable: false, keyboard: false });
      modal.open();

      const input = modal.element.querySelector('.modal-input');
      const confirmBtn = modal.element.querySelector('.modal-confirm');
      const cancelBtn = modal.element.querySelector('.modal-cancel');

      // Focus input
      input.focus();
      input.select();

      confirmBtn.addEventListener('click', () => {
        modal.close();
        resolve(input.value);
      });

      cancelBtn.addEventListener('click', () => {
        modal.close();
        resolve(null);
      });

      // Handle enter key
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          confirmBtn.click();
        }
      });
    });
  }
}

// Export for use in other modules
window.Modal = Modal;
