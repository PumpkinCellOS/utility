module.exports = class TlfTabView extends HTMLElement {
    constructor()
    {
        super();
        let bar = document.createElement("div");
        bar.classList.add("tlf-tab-bar");
        let view = document.createElement("div");

        // TODO: Overflow
        this.barElements = [];
        const createBarElement = (index, name) => {
            let element = document.createElement("div");
            element.innerText = name;
            element.onclick = () => {
                this.selectTab(index);
            };
            this.barElements.push(element);
            return element;
        }

        let index = 0;
        for(let tab of this.children)
        {
            view.appendChild(tab.cloneNode(true));
            bar.appendChild(createBarElement(index, tab.getAttribute("name")));
            index++;
        }
        this.innerHTML = "";
        this.appendChild(bar);
        this.appendChild(view);
        this.selectTab(0);
    }

    selectTab(index)
    {
        console.log(this.children);
        const viewChildren = this.children[1].children;
        const barChildren = this.firstElementChild.children;
        for(let i = 0; i < viewChildren.length; i++)
        {
            if(i == index)
            {
                viewChildren[i].style.display = "initial";
                barChildren[i].classList.add("tlf-selected");
            }
            else
            {
                viewChildren[i].style.display = "none";
                barChildren[i].classList.remove("tlf-selected");
            }
        }
    }
}



