module.exports = class TlfCombobox extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        
        const observer = new MutationObserver(function(record, observer) {
            connectedCallback();
        });
        observer.observe(this, { childList: true });
    }
    
    connectedCallback() {
        // TODO: Optimize it
        this.shadowRoot.innerHTML = "";
        
        var style = document.createElement("style");
        style.innerHTML = `

            option {
                display: none;
            }

            .tlf-selectbox {
                border-radius: 4px;
                display: inline-block;
                height: var(--tlf-widget-height);
                padding-left: 5px;
            }

            .tlf-optionbox {
                background-color: #555558;
                border-radius: 4px;
                display: none;
                left: 0px;
                max-height: 300px;
                overflow-y: auto;
                position: relative;
                top: 0px;
                width: 100%;
            }

            .tlf-option {
                padding: 3px 3px 3px 6px;
            }

            .tlf-option:hover {
                background-color: #656568;
            }
            
            button {
                background-color: #777777;
                border: none;
                border-radius: 3px;
                box-sizing: border-box;
                color: #dddddf;
                font-size: 12pt;
                margin: 5px;
                padding: 7px;
                transition: background-color 0.1s, border-color 0.1s;
            }

            button {
                height: var(--tlf-widget-height);
                float: right;
                margin: 0;
                width: var(--tlf-widget-height);
            }
        `;
        this.shadowRoot.appendChild(style);
        
        this.selectBox = document.createElement("div");
        this.selectBox.classList.add("tlf-selectbox");
        this.shadowRoot.appendChild(this.selectBox);
        
        this.openButton = document.createElement("button");
        this.openButton.onclick = () => {
            this.expand(!this.parentNode.expanded);
        };
        this.shadowRoot.appendChild(this.openButton);
        
        this.optionBox = document.createElement("div");
        this.optionBox.classList.add("tlf-optionbox");
        
        for(var optionElement of this.querySelectorAll("option"))
        {
            var option = document.createElement("div");
            option.classList.add("tlf-option");
            option.value =  optionElement.getAttribute("value");
            option.innerHTML = optionElement.innerHTML;
            option.onclick = function() {
                this.parentNode.parentNode.host.changeSelection(this);
                this.parentNode.parentNode.host.expand(false);
            }
            this.optionBox.appendChild(option);
        }
        
        this.shadowRoot.appendChild(this.optionBox);
    }
    
    expand(state) {
        if(!state)
        {
            this.expanded = false;
            this.optionBox.style.display = "";
        }
        else
        {
            this.expanded = true;
            this.optionBox.style.display = "block";
        }
    }
    
    changeSelection(node) {
        this.value = node.value;
        
        this.dispatchEvent(new Event("change"));
        
        this.selectBox.innerHTML = node.innerHTML;
    }
}
