class DataLeaksApp {
    constructor() {
        this.form = document.getElementById('dataForm');
        this.numberInput = document.getElementById('numberInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.btnText = this.searchBtn.querySelector('.btn-text');
        this.loadingSpinner = this.searchBtn.querySelector('.loading-spinner');
        this.result = document.getElementById('result');
        this.dataContent = document.getElementById('dataContent');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.API_URL = '/api/data';
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.numberInput.addEventListener('input', (e) => this.handleInput(e));
        this.numberInput.focus();
    }
    
    handleInput(e) {
        // Allow only numbers and limit to 10 digits
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const number = this.numberInput.value.trim();
        
        if (!this.validateNumber(number)) {
            this.showError('Please enter a valid 10-digit number');
            return;
        }
        
        await this.fetchData(number);
    }
    
    validateNumber(number) {
        return number.length === 10 && /^\d+$/.test(number);
    }
    
    async fetchData(number) {
        this.showLoading();
        this.hideResult();
        this.hideError();
        
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ number })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            
            if (data.success) {
                this.showResult(data.data);
            } else {
                throw new Error(data.data || 'No data found');
            }
            
        } catch (error) {
            this.showError(error.message || 'Failed to retrieve data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
    
    showResult(data) {
        this.dataContent.textContent = data;
        this.result.classList.remove('hidden');
    }
    
    hideResult() {
        this.result.classList.add('hidden');
    }
    
    showLoading() {
        this.btnText.classList.add('hidden');
        this.loadingSpinner.classList.remove('hidden');
        this.searchBtn.disabled = true;
    }
    
    hideLoading() {
        this.btnText.classList.remove('hidden');
        this.loadingSpinner.classList.add('hidden');
        this.searchBtn.disabled = false;
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.error.classList.remove('hidden');
    }
    
    hideError() {
        this.error.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DataLeaksApp();
});
