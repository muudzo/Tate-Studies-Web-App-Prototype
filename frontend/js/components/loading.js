// Loading Component
class Loading {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.isLoading = false;
  }

  // Show loading screen
  show(message = 'Loading...') {
    if (this.isLoading) return;

    this.isLoading = true;
    
    if (this.loadingScreen) {
      const messageElement = this.loadingScreen.querySelector('p');
      if (messageElement) {
        messageElement.textContent = message;
      }
      
      this.loadingScreen.classList.remove('hidden');
    }
  }

  // Hide loading screen
  hide() {
    if (!this.isLoading) return;

    this.isLoading = false;
    
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden');
    }
  }

  // Show loading with progress
  showWithProgress(message = 'Loading...', progress = 0) {
    this.show(message);
    
    // Add progress bar if it doesn't exist
    let progressBar = this.loadingScreen?.querySelector('.loading-progress');
    if (!progressBar && this.loadingScreen) {
      progressBar = Utils.createElement('div', {
        className: 'loading-progress'
      });
      
      const progressBarInner = Utils.createElement('div', {
        className: 'loading-progress-bar'
      });
      
      progressBar.appendChild(progressBarInner);
      this.loadingScreen.querySelector('.loading-content').appendChild(progressBar);
    }

    if (progressBar) {
      const progressBarInner = progressBar.querySelector('.loading-progress-bar');
      if (progressBarInner) {
        progressBarInner.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }
  }

  // Update progress
  updateProgress(progress, message = null) {
    const progressBar = this.loadingScreen?.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    if (message) {
      const messageElement = this.loadingScreen?.querySelector('p');
      if (messageElement) {
        messageElement.textContent = message;
      }
    }
  }

  // Show loading overlay on specific element
  showOverlay(element, message = 'Loading...') {
    if (!element) return null;

    const overlay = Utils.createElement('div', {
      className: 'loading-overlay'
    });

    const content = Utils.createElement('div', {
      className: 'loading-overlay-content'
    });

    const spinner = Utils.createElement('div', {
      className: 'loading-spinner'
    });

    const text = Utils.createElement('p', {
      textContent: message
    });

    content.appendChild(spinner);
    content.appendChild(text);
    overlay.appendChild(content);

    // Make element position relative if it isn't already
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }

    element.appendChild(overlay);

    return overlay;
  }

  // Hide loading overlay
  hideOverlay(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  // Show loading button
  showButton(button, loadingText = 'Loading...') {
    if (!button) return null;

    const originalText = button.innerHTML;
    const originalDisabled = button.disabled;

    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
    button.disabled = true;

    return {
      restore: () => {
        button.innerHTML = originalText;
        button.disabled = originalDisabled;
      }
    };
  }

  // Show loading with steps
  showSteps(steps, currentStep = 0) {
    this.show('Initializing...');
    
    const stepsContainer = Utils.createElement('div', {
      className: 'loading-steps'
    });

    steps.forEach((step, index) => {
      const stepElement = Utils.createElement('div', {
        className: `loading-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`
      });

      const stepIcon = Utils.createElement('div', {
        className: 'loading-step-icon'
      });

      if (index < currentStep) {
        stepIcon.innerHTML = '<i class="fas fa-check"></i>';
      } else if (index === currentStep) {
        stepIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      } else {
        stepIcon.innerHTML = '<i class="fas fa-circle"></i>';
      }

      const stepText = Utils.createElement('div', {
        className: 'loading-step-text',
        textContent: step
      });

      stepElement.appendChild(stepIcon);
      stepElement.appendChild(stepText);
      stepsContainer.appendChild(stepElement);
    });

    if (this.loadingScreen) {
      const existingSteps = this.loadingScreen.querySelector('.loading-steps');
      if (existingSteps) {
        existingSteps.remove();
      }
      this.loadingScreen.querySelector('.loading-content').appendChild(stepsContainer);
    }

    return {
      updateStep: (stepIndex, stepText = null) => {
        const stepElements = stepsContainer.querySelectorAll('.loading-step');
        stepElements.forEach((step, index) => {
          step.classList.remove('active', 'completed');
          if (index < stepIndex) {
            step.classList.add('completed');
          } else if (index === stepIndex) {
            step.classList.add('active');
          }

          const icon = step.querySelector('.loading-step-icon i');
          if (index < stepIndex) {
            icon.className = 'fas fa-check';
          } else if (index === stepIndex) {
            icon.className = 'fas fa-spinner fa-spin';
          } else {
            icon.className = 'fas fa-circle';
          }
        });

        if (stepText) {
          const textElement = stepElements[stepIndex]?.querySelector('.loading-step-text');
          if (textElement) {
            textElement.textContent = stepText;
          }
        }
      }
    };
  }

  // Create loading state for async operations
  static async withLoading(asyncFunction, message = 'Loading...') {
    const loading = new Loading();
    loading.show(message);
    
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      loading.hide();
    }
  }

  // Create loading state with progress for async operations
  static async withProgress(asyncFunction, message = 'Loading...') {
    const loading = new Loading();
    loading.showWithProgress(message, 0);
    
    try {
      const result = await asyncFunction((progress, stepMessage) => {
        loading.updateProgress(progress, stepMessage);
      });
      return result;
    } finally {
      loading.hide();
    }
  }
}

// Create global loading instance
window.loading = new Loading();
window.Loading = Loading;
