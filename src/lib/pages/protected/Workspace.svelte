<script>
    import { onMount } from "svelte";
    import Button from "../../components/Button.svelte";
    import Navbar from "../../components/Navbar.svelte";
    import { authState } from "../../stores/auth.svelte";
    import { navigateTo } from "../../stores/page.svelte";

    class LMSSync{

        /**
         * 
         * @param {chrome.tabs.Tab} tab
         * @throws "Page not allowed to scrape" if the page isnt a authorized page to scrape
         */
        static #is_valid_page(tab){
            //find a way to not hardcode this url
            if( !tab.url.includes("univermilenium.myopenlms.net/mod/scorm") ) throw new Error("Page not allowed to scrape");
        }

        
        static async get_full_course(){

            const tab = await LMSSync.get_current_tab();
            LMSSync.#is_valid_page(tab);
            
            let response = await chrome.tabs.sendMessage( tab.id, {action: "get_course"} );
            console.log(response);
        }
        
        /**
         * Return current active tab
         */
        static async get_current_tab() {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            return tab;
        }
        

        /**
         * 
         * @param tab {chrome.tabs.Tab}
        */
        static async get_scraped_slides(tab){
            let scraped_slides = await chrome.tabs.sendMessage( tab.id, {action: "begin_scrapping"} );
            return scraped_slides;
        }   


    }


    onMount(()=>{
        //Redundancy check
        //Add real api call for redundancy check?
        if( !authState.isLoggedIn ){
            navigateTo("login");
        }
    });

</script>

<section class="w-full h-full text-center bg-neutral-900">

    <Navbar/>
    
    
    <h1 class="bg-neutral-950 py-2 font-semibold">
        Workspace
    </h1>
    
    <section>
        <h1 class="py-2">Course opions</h1>

        <Button onclick={LMSSync.get_full_course}>
            Save course
        </Button>
         
    </section>

</section>