
class Vote extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        // Constants for public API.
        const anon_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudm13b2RnenlibmNsYWFsa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA5MDIyMjQsImV4cCI6MjAzNjQ3ODIyNH0.5fPrBmMp7MbEhl62rX3IxKwVKOvrFiXg3fipe9fRLwA";
        const api_base_url = "https://vnvmwodgzybnclaalkxx.supabase.co";
        // TODO: default to current year.
        const year = 2023;

        // Fetch the HTML for the custom component.
        const res = await fetch('/components/vote/vote.html');
        // Insert the HTML into the DOM.
        this.innerHTML = await res.text();
        // Fetch the available monsters from the public API.
        await this.getData(api_base_url, anon_api_key, year);
        // Wire up the form to POST data to the API on submit.
        this.registerHandlers(api_base_url, anon_api_key);
    }

    registerHandlers(base_url, anon_key) {
        const form = document.getElementById('monster-vote-form');

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.submitForm(base_url, anon_key);
        })
    }

    async getData(base_url, anon_key, year) {
        const url = `${base_url}/rest/v1/monsters?season=eq.${year}`;

        const monsterOptions = document.getElementById('monster-options');

        try {
            const response = await fetch(url, {
                headers: {
                    "apiKey": anon_key,
                    "Authorization": `Bearer ${anon_key}`
                }
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            // TODO: remove logging.
            console.log(json);

            // Add the dynamically generated monster options to the div.
            json.forEach(item => {
                monsterOptions.innerHTML += this.buildMonsterOption(item);
            });


        } catch (error) {
            console.error(error.message);
        }
    }

    // Note: nothing is escaped or sanitized, input is assumed trusted.
    buildMonsterOption(json) {
        const html = `
        <div class="w-48 lg:w-60 relative place-self-center justify-self-center">
            <input id="monster-${json.id}" name="favorite_monster" value="${json.id}" type="radio" class="peer hidden">
            <label for="monster-${json.id}"
            class="relative peer-checked:ring-4 peer-checked:ring-sf-orange-600 rounded-lg block text-sm font-medium leading-6">
            <img class="relative w-48 lg:w-60 h-72 object-cover overflow-hidden bg-sf-red-50 rounded-lg z-0"
                src="${json.image_url}"
                alt="A picture of the ${json.name} monster created by ${json.business}">
            <div class="absolute bottom-0 bg-sf-grey-900/70 text-white w-full rounded-b-lg py-2 px-4">
                <span class="block text-sf-grey-100 -mb-1 z-20">${json.business}</span>
                <div class="flex justify-between">
                <span class="block font-semibold text-xl z-20">${json.name}</span>
                </div>
            </div>
            </label>
        </div>
      `;
        return html;
    }

    async submitForm(base_url, anon_key) {
        const url = `${base_url}/rest/v1/votes`;

        // Get form data.
        const form = document.getElementById('monster-vote-form');
        const formData = new FormData(form);
        const object = {};
        formData.forEach((value, key) => object[key] = value);
        const formJson = object
        // TODO: remove logging.
        console.log(formJson)

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "apiKey": anon_key,
                    "Authorization": `Bearer ${anon_key}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formJson)
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            // Reset the form state.
            form.reset();
            // TODO: show a success message to the user.

        } catch (error) {
            // TODO: show an error message to the user.
            console.error(error.message);
        }
    }
}

// Register the custom component to be used in HTML with the <stellmar-vote> tag.
customElements.define('stellmar-vote', Vote);
