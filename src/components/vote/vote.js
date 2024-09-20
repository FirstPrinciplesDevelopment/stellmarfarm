
class Vote extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        // Constants for public API.
        const anon_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudm13b2RnenlibmNsYWFsa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA5MDIyMjQsImV4cCI6MjAzNjQ3ODIyNH0.5fPrBmMp7MbEhl62rX3IxKwVKOvrFiXg3fipe9fRLwA";
        const api_base_url = "https://vnvmwodgzybnclaalkxx.supabase.co";
        // TODO: default to current year.
        const year = 2024;

        // Fetch the HTML for the custom component.
        const res = await fetch('../components/vote/vote.html');
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
        <div class="peer w-48 lg:w-60 relative place-self-center justify-self-center peer-has-[>input:checked]:opacity-50 has-[~div>input:checked]:opacity-50">
            <input required id="monster-${json.id}" name="favorite_monster" value="${json.id}" type="radio" class="peer relative top-8 left-8 z-0">
            <label for="monster-${json.id}"
                class="relative peer-checked:ring-4 peer-checked:ring-sf-orange-600 rounded-lg block text-sm font-medium leading-6">
            <img class="relative w-48 lg:w-60 h-72 object-cover overflow-hidden bg-sf-red-50 rounded-lg z-10"
                src="${json.image_url}"
                alt="A picture of the ${json.name} monster created by ${json.business}">
            <div class="absolute bottom-0 bg-sf-grey-900/70 text-white w-full rounded-b-lg py-2 px-4 z-20">
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

    buildSuccessMessage() {
        return `
            <div class="min-h-screen flex flex-col justify-center">
                <div class="py-8">
                    <h1 class="text-3xl md:text-4xl text-sf-green-700">Success! Thank you.</h1>
                    <p>Your vote has been counted.</p>
                </div>
                <div class="py-8">
                    <a class="rounded-md bg-sf-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sf-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-orange-600" href="index.html">Back to Stellmar Farm →</a>
                    </div>
                <br><br>
                </div>
            </div>
        `;
    }

    buildErrorMessage() {
        return `
            <div class="min-h-screen flex flex-col justify-center">
                <div class="py-8">
                    <h1 class="text-3xl md:text-4xl text-sf-red-700">Sorry! Something went wrong.</h1>
                    <p>Please try again later or <a class="underline hover:text-sf-orange-700" href="mailto:info@stellmarfarm.com">contact us</a>.</p>
                </div>
                <div class="py-8">
                    <a class="rounded-md bg-sf-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sf-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sf-orange-600" href="index.html">Back to Stellmar Farm →</a>
                    </div>
                <br><br>
                </div>
            </div>
        `;
    }

    async submitForm(base_url, anon_key) {
        const url = `${base_url}/rest/v1/votes`;
        
        const formContainer = document.getElementById('monster-vote-container');

        // Get form data.
        const form = document.getElementById('monster-vote-form');
        const formData = new FormData(form);
        const object = {};
        formData.forEach((value, key) => object[key] = value);
        const formJson = object

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

            // Reset the form state.
            form.reset();

            // Replace the form with success or error message.
            if (response.ok) {
                // 200 response from API, show success message.
                formContainer.innerHTML = this.buildSuccessMessage();
            }
            else {
                // Something went wrong, show error message.
                formContainer.innerHTML = this.buildErrorMessage();
            }

            // Make sure the user can see the message.
            window.scrollTo({top: 0});

        } catch (error) {
                // Something went wrong, show error message.
                formContainer.innerHTML = this.buildErrorMessage();
        }
    }
}

// Register the custom component to be used in HTML with the <stellmar-vote> tag.
customElements.define('stellmar-vote', Vote);
