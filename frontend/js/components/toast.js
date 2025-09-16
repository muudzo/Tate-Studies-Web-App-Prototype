// Toast Notification Component
class Toast {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = new Map();
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = Utils.createElement('div', {
        id: 'toast-container',
        className: 'toast-container'
      });
      document.body.appendChild(this.container);
    }
  }

  // Show toast notification
  show(message, type = 'info', options = {}) {
    const defaultOptions = {
      duration: 5000,
      closable: true,
      title: null,
      action: null
    };

    const config = { ...defaultOptions, ...options };
    const id = Utils.generateId();

    const toast = this.createToast(id, message, type, config);
    this.container.appendChild(toast);
    this.toasts.set(id, toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove
    if (config.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, config.duration);
    }

    return id;
  }

  // Create toast element
  createToast(id, message, type, options) {
    const toast = Utils.createElement('div', {
      className: `toast toast-${type}`,
      'data-id': id
    });

    const icon = this.getIcon(type);
    const title = options.title ? `<div class="toast-title">${options.title}</div>` : '';
    const action = options.action ? this.createActionButton(options.action) : '';
    const closeBtn = options.closable ? '<button class="toast-close"><i class="fas fa-times"></i></button>' : '';

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${icon}"></i>
      </div>
      <div class="toast-content">
        ${title}
        <div class="toast-message">${message}</div>
      </div>
      ${action}
      ${closeBtn}
    `;

    // Add event listeners
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.remove(id));
    }

    const actionButton = toast.querySelector('.toast-action');
    if (actionButton) {
      actionButton.addEventListener('click', options.action.handler);
    }

    return toast;
  }

  // Get icon for toast type
  getIcon(type) {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
  }

  // Create action button
  createActionButton(action) {
    return `
      <button class="btn btn-sm toast-action" style="margin-left: auto;">
        ${action.text}
      </button>
    `;
  }

  // Remove toast
  remove(id) {
    const toast = this.toasts.get(id);
    if (!toast) return;

    toast.classList.remove('show');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(id);
    }, 300);
  }

  // Remove all toasts
  removeAll() {
    this.toasts.forEach((toast, id) => {
      this.remove(id);
    });
  }

  // Update toast
  update(id, message, type = null) {
    const toast = this.toasts.get(id);
    if (!toast) return;

    const messageElement = toast.querySelector('.toast-message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    if (type) {
      toast.className = `toast toast-${type}`;
      const iconElement = toast.querySelector('.toast-icon i');
      if (iconElement) {
        iconElement.className = this.getIcon(type);
      }
    }
  }

  // Static methods for convenience
  static success(message, options = {}) {
    return toast.show(message, 'success', options);
  }

  static error(message, options = {}) {
    return toast.show(message, 'error', { duration: 7000, ...options });
  }

  static warning(message, options = {}) {
    return toast.show(message, 'warning', options);
  }

  static info(message, options = {}) {
    return toast.show(message, 'info', options);
  }

  // Show loading toast
  static loading(message = 'Loading...', options = {}) {
    const loadingOptions = {
      duration: 0, // Don't auto-remove
      closable: false,
      ...options
    };

    const id = toast.show(message, 'info', loadingOptions);
    
    // Add spinner
    const toastElement = toast.toasts.get(id);
    if (toastElement) {
      const icon = toastElement.querySelector('.toast-icon i');
      if (icon) {
        icon.className = 'fas fa-spinner fa-spin';
      }
    }

    return id;
  }

  // Update loading toast
  static updateLoading(id, message, type = 'success') {
    toast.update(id, message, type);
    
    // Auto-remove after update
    setTimeout(() => {
      toast.remove(id);
    }, 3000);
  }
}

// Create global toast instance
window.toast = new Toast();
window.Toast = Toast;
