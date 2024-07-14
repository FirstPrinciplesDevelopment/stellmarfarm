class Hours extends HTMLElement {
    constructor() {
        super();
    }
  
    async connectedCallback() {
        let res = await fetch('/components/hours/hours.html');
        
        this.innerHTML = await res.text();
        
        
    }
  }
  
  customElements.define('stellmar-hours', Hours);